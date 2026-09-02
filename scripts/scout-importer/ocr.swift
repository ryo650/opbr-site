import AppKit
import Foundation
import Vision

struct OCRResult: Codable {
  let file: String
  let lines: [String]
  let observations: [OCRObservation]
}

struct OCRObservation: Codable {
  let text: String
  let x: Double
  let y: Double
  let width: Double
  let height: Double
}

func recognize(path: String) throws -> OCRResult {
  guard
    let image = NSImage(contentsOfFile: path),
    let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
  else {
    throw NSError(
      domain: "ScoutImporter",
      code: 1,
      userInfo: [NSLocalizedDescriptionKey: "Could not load image: \(path)"]
    )
  }

  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.recognitionLanguages = ["en-US"]
  request.usesLanguageCorrection = true

  let handler = VNImageRequestHandler(cgImage: cgImage)
  try handler.perform([request])

  let recognized = (request.results ?? []).sorted {
    let leftY = $0.boundingBox.midY
    let rightY = $1.boundingBox.midY
    if abs(leftY - rightY) > 0.015 {
      return leftY > rightY
    }
    return $0.boundingBox.minX < $1.boundingBox.minX
  }

  let lines = recognized.compactMap {
    $0.topCandidates(1).first?.string
  }
  let observations = recognized.compactMap { observation -> OCRObservation? in
    guard let text = observation.topCandidates(1).first?.string else {
      return nil
    }
    let box = observation.boundingBox
    return OCRObservation(
      text: text,
      x: box.minX,
      y: box.minY,
      width: box.width,
      height: box.height
    )
  }

  return OCRResult(
    file: URL(fileURLWithPath: path).lastPathComponent,
    lines: lines,
    observations: observations
  )
}

do {
  let results = try CommandLine.arguments.dropFirst().map(recognize)
  let encoder = JSONEncoder()
  encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
  let data = try encoder.encode(results)
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data("\n".utf8))
} catch {
  FileHandle.standardError.write(Data("OCR failed: \(error.localizedDescription)\n".utf8))
  exit(1)
}
