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
}
async function reload(preserve = true) {
  const remembered = preserve ? new Map([...editors].map(([id, editor]) => [id, editor.read()])) : new Map();
  state = await api('/api/state');
  editors.clear(); document.getElementById('rows').replaceChildren();
  document.getElementById('empty').hidden = state.drafts.length > 0;
  document.getElementById('counts').textContent = `${state.drafts.filter(row => row.status === 'pending').length}件確認待ち · ${state.records.length}体保存済み`;
  for (const draft of state.drafts) renderRow(draft, remembered.get(draft.id));
}
function renderRow(draft, memory) {
  const saved = draft.status === 'saved';
  const row = element('section', undefined, `row${saved ? ' saved' : ''}`);
  row.append(element('h2', draft.sourceImage), element('p', saved ? '保存済み' : '確認待ち', 'status'));
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
  select.value = memory?.characterId ?? draft.characterId ?? ''; characterLabel.append(select); form.append(characterLabel);
  const idText = element('p', '', 'small'); form.append(idText);
  const fields = element('div', undefined, 'fields'); const inputs = {};
  for (const field of statFields) {
    const label = element('label', labels[field]); const input = element('input'); input.type = 'number'; input.min = '0'; input.step = field === 'crit' ? '0.01' : '1'; input.setAttribute('aria-label', labels[field]);
    input.value = (memory?.maxStats ?? draft.maxStats)[field] ?? ''; inputs[field] = input; label.append(input); fields.append(label);
  }
  form.append(fields);
  const conditions = element('div', undefined, 'conditions'); const conditionInputs = {};
  const names = { level: 'レベル', levelMaximum: '最大レベル', characterBoost: 'Boost', characterBoostMaximum: '最大Boost' };
  for (const [field, name] of Object.entries(names)) {
    const label = element('label', name); const input = element('input'); input.type = 'number'; input.step = '1'; input.setAttribute('aria-label', name); input.value = (memory?.conditions ?? draft.conditions)[field] ?? '';
    conditionInputs[field] = input; label.append(input); conditions.append(label);
  }
  form.append(conditions);
  const checks = element('div', undefined, 'checks');
  function check(text) { const label = element('label'); const input = element('input'); input.type = 'checkbox'; label.append(input, document.createTextNode(text)); checks.append(label); return input; }
  const screen = check('「Stats of max level」の画面であることを確認'); screen.checked = (memory?.conditions ?? draft.conditions).screen === 'stats-of-max-level';
  const medals = check('3つのメダル枠がすべて未装備であることを確認'); medals.checked = memory?.conditions?.medalsEquipped === false;
  const diff = element('table'); form.append(diff);
  const overwrite = check('差分を確認し、既存の数値の上書きを許可');
  const reviewed = check('キャラクター・入力した数値・条件を画像と照合し、この行を承認');
  form.append(checks);
  const issues = element('p', '', 'issues'); form.append(issues);
  const actions = element('div', undefined, 'actions'); const chosenLabel = element('label'); const chosen = element('input'); chosen.type = 'checkbox'; chosen.checked = memory?.chosen ?? false; chosenLabel.append(chosen, document.createTextNode('まとめて保存する対象')); const save = element('button', 'この行を保存'); actions.append(chosenLabel, save); form.append(actions);
  layout.append(preview, form); row.append(layout); document.getElementById('rows').append(row);
  function read() {
    return { draftId: draft.id, characterId: select.value || null,
      maxStats: Object.fromEntries(statFields.map(field => [field, inputs[field].value === '' ? null : Number(inputs[field].value)])),
      conditions: { screen: screen.checked ? 'stats-of-max-level' : null, ...Object.fromEntries(Object.entries(conditionInputs).map(([field, input]) => [field, input.value === '' ? null : Number(input.value)])), medalsEquipped: medals.checked ? false : null },
      reviewed: reviewed.checked, allowOverwrite: overwrite.checked, chosen: chosen.checked };
  }
  function update() {
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
    issues.textContent = saved ? '保存が完了しました。' : warnings.join(' ');
  }
  for (const control of [select, ...Object.values(inputs), ...Object.values(conditionInputs), screen, medals]) control.addEventListener('input', () => { reviewed.checked = false; overwrite.checked = false; update(); });
  reviewed.addEventListener('change', update); overwrite.addEventListener('change', update);
  // Reloading the catalog invalidates earlier approvals, even when edits survive.
  reviewed.checked = false; overwrite.checked = false; update();
  if (saved) { form.querySelectorAll('input,select,button').forEach(node => { node.disabled = true; }); save.dataset.saved = 'true'; }
  save.addEventListener('click', () => saveRows([read()]));
  editors.set(draft.id, { read, saved });
}
async function saveRows(selections) {
  if (loading) return;
  busy(true);
  try { const result = await api('/api/save', { expectedRevision: state.revision, selections }); await reload(); showMessage(`${result.saved}件を保存しました。未承認の行は確認待ちのままです。`); }
  catch (error) { showMessage(error.message); }
  finally { busy(false); }
}
document.getElementById('save-selected').addEventListener('click', () => saveRows([...editors.values()].filter(editor => !editor.saved && editor.read().chosen).map(editor => editor.read())));
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
