#!/usr/bin/env swift
import AppKit
import Foundation
import Vision

struct OCRRecord: Codable {
    let file: String
    let text: String
    let confidence: Float
}

guard CommandLine.arguments.count >= 2 else {
    fputs("usage: ocr_macos.swift <image-directory>\n", stderr)
    exit(2)
}

let directory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let files = (try FileManager.default.contentsOfDirectory(
    at: directory,
    includingPropertiesForKeys: nil,
    options: [.skipsHiddenFiles]
)).filter { ["jpg", "jpeg", "png"].contains($0.pathExtension.lowercased()) }
 .sorted { $0.lastPathComponent < $1.lastPathComponent }

let encoder = JSONEncoder()

for file in files {
    autoreleasepool {
        guard let image = NSImage(contentsOf: file),
              let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
            return
        }

        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["zh-Hans", "en-US"]
        request.usesLanguageCorrection = true
        request.minimumTextHeight = 0.035

        do {
            try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
            let candidates = (request.results ?? []).compactMap { observation -> (String, Float, CGRect)? in
                guard let candidate = observation.topCandidates(1).first else { return nil }
                return (candidate.string, candidate.confidence, observation.boundingBox)
            }.sorted {
                if abs($0.2.midY - $1.2.midY) > 0.08 {
                    return $0.2.midY > $1.2.midY
                }
                return $0.2.minX < $1.2.minX
            }
            let text = candidates.map { $0.0 }
                .joined(separator: " ")
                .replacingOccurrences(of: "\t", with: " ")
                .replacingOccurrences(of: "\n", with: " ")
            guard !text.isEmpty else { return }
            let confidence = candidates.isEmpty
                ? 0
                : candidates.map { $0.1 }.reduce(0, +) / Float(candidates.count)
            let record = OCRRecord(file: file.lastPathComponent, text: text, confidence: confidence)
            if let data = try? encoder.encode(record), let line = String(data: data, encoding: .utf8) {
                print(line)
            }
        } catch {
            fputs("OCR failed for \(file.path): \(error)\n", stderr)
        }
    }
}
