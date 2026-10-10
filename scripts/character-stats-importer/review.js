/* global document, fetch, FileReader */
const token = document.querySelector('meta[name=review-token]').content;
const statFields = ['hp', 'atk', 'def', 'crit', 'totalPower'];
const labels = { hp: 'HP', atk: 'ATK', def: 'DEF', crit: 'CRIT %', totalPower: '総合力' };
let state;
let loading = false;
const editors = new Map();
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
async function api(path, data) {
  const response = await fetch(path, { method: data ? 'POST' : 'GET', headers: { 'x-review-token': token, ...(data ? { 'Content-Type': 'application/json' } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error);
  return value;
}
function showMessage(text) { document.getElementById('message').textContent = text; }
function busy(value) {
  loading = value;
  document.querySelectorAll('button').forEach(button => { button.disabled = value || button.dataset.saved === 'true'; });
  document.querySelectorAll('input, select').forEach(control => { control.disabled = value || !!control.closest('.saved'); });
  for (const editor of editors.values()) editor.syncDisabled();
}
async function reload(preserve = true) {
  const remembered = preserve ? new Map([...editors].map(([id, editor]) => [id, editor.read()])) : new Map();
  state = await api('/api/state');
  editors.clear(); document.getElementById('rows').replaceChildren();
  document.getElementById('empty').hidden = state.drafts.length > 0;
  document.getElementById('counts').textContent = `最大値 ${state.drafts.filter(row => row.status === 'pending').length}件確認待ち · 基礎値 ${state.drafts.filter(row => !row.baseSaved).length}件確認待ち`;
  for (const draft of state.drafts) renderRow(draft, remembered.get(draft.id));
}
function renderRow(draft, memory) {
  const saved = draft.status === 'saved';
  const baseSaved = draft.baseSaved === true;
  const allSaved = saved && baseSaved;
  const initial = memory ?? draft.lastCorrection ?? draft;
  const row = element('section', undefined, `row${allSaved ? ' saved' : ''}`);
  row.append(element('h2', draft.sourceImage), element('p', `最大値: ${saved ? '保存済み' : '確認待ち'} · 基礎値: ${baseSaved ? '保存済み' : '確認待ち'}`, 'status'));
  const layout = element('div', undefined, 'layout');
  const preview = element('div');
  const link = element('a'); link.href = `/image/${draft.id}`; link.target = '_blank'; link.rel = 'noopener';
  const image = element('img', undefined, 'screenshot'); image.src = link.href; image.alt = `${draft.sourceImage}のステータス画像`; link.append(image);
  preview.append(link, element('p', `OCR: ${draft.identityText || '名前を認識できませんでした'}`, 'identity'), element('p', '画像をクリックすると原寸で確認できます。', 'small'));
  const detail = element('details'); detail.append(element('summary', 'OCRの原文と切り出し位置'), element('pre', JSON.stringify({ ocr: draft.ocr, crops: draft.crops, match: draft.match }, null, 2))); preview.append(detail);
  const form = element('div');
  const characterLabel = element('label', 'キャラクター（バージョン名まで確認）');
  const select = element('select'); select.setAttribute('aria-label', 'キャラクター');
  const unknown = element('option', '未照合・選択してください'); unknown.value = ''; select.append(unknown);
  const suggestions = new Set(draft.match.candidates.map(candidate => candidate.characterId));
  const choices = [...state.characters].sort((a, b) => Number(suggestions.has(b.id)) - Number(suggestions.has(a.id)) || a.name.localeCompare(b.name));
  for (const character of choices) {
    const option = element('option', `${suggestions.has(character.id) ? '候補 · ' : ''}${character.name.replaceAll('-', ' ')} · ${character.element}/${character.role}`);
    option.value = character.id; select.append(option);
  }
  select.value = initial.characterId ?? ''; characterLabel.append(select); form.append(characterLabel);
  const idText = element('p', '', 'small'); form.append(idText);
  const fields = element('div', undefined, 'fields'); const inputs = {};
  for (const field of statFields) {
    const label = element('label', labels[field]); const input = element('input'); input.type = 'number'; input.min = '0'; input.step = field === 'crit' ? '0.01' : '1'; input.setAttribute('aria-label', labels[field]);
    input.value = initial.maxStats[field] ?? ''; inputs[field] = input; label.append(input); fields.append(label);
  }
  form.append(fields);
  const conditions = element('div', undefined, 'conditions'); const conditionInputs = {};
  const names = { level: 'レベル', levelMaximum: '最大レベル', characterBoost: 'Boost', characterBoostMaximum: '最大Boost' };
  for (const [field, name] of Object.entries(names)) {
    const label = element('label', name); const input = element('input'); input.type = 'number'; input.step = '1'; input.setAttribute('aria-label', name); input.value = initial.conditions[field] ?? '';
    conditionInputs[field] = input; label.append(input); conditions.append(label);
  }
  form.append(conditions);
  const checks = element('div', undefined, 'checks');
  function check(text) { const label = element('label'); const input = element('input'); input.type = 'checkbox'; label.append(input, document.createTextNode(text)); checks.append(label); return input; }
  const screen = check('「Stats of max level」の画面であることを確認'); screen.checked = initial.conditions.screen === 'stats-of-max-level';
  const medals = check('3つのメダル枠がすべて未装備であることを確認'); medals.checked = initial.conditions.medalsEquipped === false;
  form.append(element('h3', '最大ステータスの差分'));
  const diff = element('table'); form.append(diff);
  form.append(element('h3', 'Boost Max → 基礎ステータス'));
  const conversion = element('table'); form.append(conversion);
  const conversionIssues = element('p', '', 'issues'); form.append(conversionIssues);
  let previewReady = false;
  let previewEpoch = 0;
  const overwrite = check('最大値の差分を確認し、最大値の上書きを許可');
  const reviewed = check('キャラクター・入力した数値・条件を画像と照合し、この行を承認');
  const baseOverwrite = check('基礎値の差分を確認し、既存の基礎値の上書きを許可');
  const baseReviewed = check('Boost Maxの差引き値・変換後の基礎値・既存値との差分を確認し、基礎値の保存を承認');
  form.append(checks);
  const issues = element('p', '', 'issues'); form.append(issues);
  const actions = element('div', undefined, 'actions'); const chosenLabel = element('label'); const chosen = element('input'); chosen.type = 'checkbox'; chosen.checked = memory?.chosen ?? false; chosenLabel.append(chosen, document.createTextNode('まとめて保存する対象')); const save = element('button', '最大値を保存'); const saveBase = element('button', '基礎値を保存'); actions.append(chosenLabel, save, saveBase); form.append(actions);
  layout.append(preview, form); row.append(layout); document.getElementById('rows').append(row);
  function read() {
    return { draftId: draft.id, characterId: select.value || null,
      maxStats: Object.fromEntries(statFields.map(field => [field, inputs[field].value === '' ? null : Number(inputs[field].value)])),
      conditions: { screen: screen.checked ? 'stats-of-max-level' : null, ...Object.fromEntries(Object.entries(conditionInputs).map(([field, input]) => [field, input.value === '' ? null : Number(input.value)])), medalsEquipped: medals.checked ? false : null },
      reviewed: reviewed.checked, allowOverwrite: overwrite.checked, baseReviewed: previewReady && baseReviewed.checked, allowBaseOverwrite: baseOverwrite.checked, chosen: chosen.checked };
  }
  function update(refreshPreview = true) {
    const input = read(); const existing = state.records.find(record => record.characterId === input.characterId);
    idText.textContent = `ID: ${input.characterId ?? '未選択'}`;
    diff.replaceChildren(); const head = element('tr'); for (const label of ['項目', '保存済み', '今回', '保存後']) head.append(element('th', label)); diff.append(head);
    let conflict = false;
    for (const field of statFields) {
      const old = existing?.maxStats[field] ?? null; const value = input.maxStats[field]; const changed = old !== null && value !== null && old !== value; conflict ||= changed;
      const tr = element('tr', undefined, changed ? 'changed' : ''); for (const text of [labels[field], old ?? '—', value ?? '空欄', value ?? old ?? '—']) tr.append(element('td', String(text))); diff.append(tr);
    }
    overwrite.parentElement.hidden = !conflict;
    if (!conflict) overwrite.checked = false;
    const warnings = [];
    if (!input.characterId) warnings.push('キャラクターIDを選択してください。');
    if (!['hp', 'atk', 'def'].some(field => input.maxStats[field] !== null)) warnings.push('HP・ATK・DEFを最低1項目入力してください。');
    if (!screen.checked || !medals.checked || conditionInputs.level.value !== '100' || conditionInputs.levelMaximum.value !== '100' || conditionInputs.characterBoost.value !== '52' || conditionInputs.characterBoostMaximum.value !== '52') warnings.push('最大画面・Lv100/100・Boost52/52・メダル未装備を確認してください。');
    if (!reviewed.checked) warnings.push('この行はまだ承認されていません。');
    if (conflict && !overwrite.checked) warnings.push('既存値と異なります。差分確認後、上書きを明示的に許可してください。');
    issues.textContent = allSaved ? '最大値・基礎値の保存が完了しました。' : warnings.join(' ');
    if (refreshPreview) void updateBasePreview();
  }
  async function updateBasePreview() {
    const epoch = ++previewEpoch;
    previewReady = false; baseReviewed.checked = false; baseOverwrite.checked = false;
    baseReviewed.disabled = true;
    conversion.replaceChildren(); conversionIssues.textContent = '基礎値を計算中…';
    baseOverwrite.parentElement.hidden = true;
    try {
      const input = read();
      const result = await api('/api/base-preview', { expectedRevision: state.baseCatalog.revision, selection: input });
      if (epoch !== previewEpoch) return;
      const head = element('tr'); for (const label of ['項目', '最大値', 'Boost Max', '変換基礎値', '既存基礎値', '反映後']) head.append(element('th', label)); conversion.append(head);
      for (const item of result.diff) {
        const field = { baseHp: 'hp', baseAtk: 'atk', baseDef: 'def' }[item.field];
        const changed = item.previous !== null && item.derived !== null && item.previous !== item.derived;
        const tr = element('tr', undefined, changed ? 'changed' : '');
        for (const text of [labels[field], input.maxStats[field] ?? '空欄', `−${result.boost[field]}`, item.derived ?? '未取得', item.previous ?? '未登録', item.next ?? '未取得']) tr.append(element('td', String(text)));
        conversion.append(tr);
      }
      baseOverwrite.parentElement.hidden = !result.conflict;
      conversionIssues.textContent = result.issues.join(' ') || (result.existing ? '既存データとの比較を確認してください。空欄は既存値を保持します。' : '新規基礎値です。画像・変換結果を確認して承認してください。');
      previewReady = result.issues.length === 0;
      syncDisabled();
    } catch (error) { if (epoch === previewEpoch) conversionIssues.textContent = error.message; }
  }
  for (const control of [select, ...Object.values(inputs), ...Object.values(conditionInputs), screen, medals]) control.addEventListener('input', () => { reviewed.checked = false; overwrite.checked = false; baseReviewed.checked = false; baseOverwrite.checked = false; update(); });
  reviewed.addEventListener('change', () => update(false)); overwrite.addEventListener('change', () => update(false));
  baseReviewed.addEventListener('change', () => { if (!previewReady) baseReviewed.checked = false; });
  // Reloading either catalog invalidates approvals, even when edits survive.
  reviewed.checked = false; overwrite.checked = false; baseReviewed.checked = false; baseOverwrite.checked = false; update();
  save.dataset.saved = String(saved); save.disabled = saved;
  saveBase.dataset.saved = String(baseSaved); saveBase.disabled = baseSaved;
  if (allSaved) form.querySelectorAll('input,select').forEach(node => { node.disabled = true; });
  save.addEventListener('click', () => saveRows([read()]));
  saveBase.addEventListener('click', () => saveRows([read()], true));
  function syncDisabled() { baseReviewed.disabled = loading || !previewReady || baseSaved; }
  editors.set(draft.id, { read, saved, baseSaved, syncDisabled });
}
async function saveRows(selections, base = false) {
  if (loading) return;
  busy(true);
  try {
    const result = await api(base ? '/api/base-save' : '/api/save', { expectedRevision: base ? state.baseCatalog.revision : state.revision, selections });
    await reload(); showMessage(`${result.saved}件の${base ? '基礎値' : '最大値'}を保存しました。もう一方の保存には再確認・承認が必要です。`);
  }
  catch (error) { showMessage(error.message); }
  finally { busy(false); }
}
function selected(base = false) { return [...editors.values()].filter(editor => !(base ? editor.baseSaved : editor.saved) && editor.read().chosen).map(editor => editor.read()); }
document.getElementById('save-selected').addEventListener('click', () => saveRows(selected()));
document.getElementById('save-base-selected').addEventListener('click', () => saveRows(selected(true), true));
document.getElementById('reload').addEventListener('click', async () => { if (loading) return; busy(true); try { await reload(); showMessage('最新データを読み込みました。差分を確認し直してください。'); } catch (error) { showMessage(error.message); } finally { busy(false); } });

function base64(file) { return new Promise((accept, reject) => { const reader = new FileReader(); reader.onload = () => accept(reader.result.split(',')[1]); reader.onerror = () => reject(new Error('画像を読み込めませんでした。')); reader.readAsDataURL(file); }); }
document.getElementById('files').addEventListener('change', async event => {
  const files = [...event.target.files]; if (!files.length || loading) return;
  if (files.length > 20) { showMessage('一度に20枚まで選択してください。'); return; }
  busy(true); const failures = [];
  try {
    for (const [index, file] of files.entries()) {
      showMessage(`${index + 1}/${files.length} 読み取り中: ${file.name}`);
      try { if (file.size > 10 * 1024 * 1024) throw new Error('10 MB以下の画像を選択してください。'); await api('/api/upload', { name: file.name, data: await base64(file) }); }
      catch (error) { failures.push(`${file.name}: ${error.message}`); }
    }
    await reload(); showMessage(failures.length ? failures.join('\n') : `${files.length}枚の読み取りが完了しました。各行を画像と照合してください。`);
  } catch (error) { showMessage(error.message); }
  finally { event.target.value = ''; busy(false); }
});
reload(false).catch(error => showMessage(error.message));
