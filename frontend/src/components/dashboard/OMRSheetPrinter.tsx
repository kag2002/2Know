"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register fonts if needed here.
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  // OMR Critical Registration Marks (Must be absolute and EXACTLY spaced for OpenCV Scanner)
  anchorTopLeft: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 15,
    height: 15,
    backgroundColor: "#000000",
  },
  anchorTopRight: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 15,
    height: 15,
    backgroundColor: "#000000",
  },
  anchorBottomLeft: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 15,
    height: 15,
    backgroundColor: "#000000",
  },
  anchorBottomRight: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 15,
    height: 15,
    backgroundColor: "#000000",
  },
  header: {
    marginTop: 20, // push down below anchors
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  studentInfoBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoField: {
    flexDirection: "row",
    gap: 5,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  infoLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "dotted",
    width: 120,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  questionRow: {
    width: "48%", // 2 columns
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  questionNum: {
    width: 25,
    fontSize: 10,
    textAlign: "right",
  },
  bubble: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: {
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#888",
  },
  // --- Hybrid Questions Styles ---
  questionPage: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  questionHeader: {
    marginBottom: 20, 
    textAlign: "center"
  },
  questionText: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  optionText: {
    fontSize: 11,
    marginLeft: 15,
    marginBottom: 4,
    color: "#333",
  }
});

interface OMRSheetProps {
  quizTitle: string;
  numberOfQuestions: number;
  questions?: any[];
}

export const OMRSheet = ({ quizTitle, numberOfQuestions, questions }: OMRSheetProps) => {
  const questionNumbers = Array.from({ length: numberOfQuestions }, (_, i) => i + 1);
  const options = ["A", "B", "C", "D"];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Registration Anchors for Machine Vision */}
        <View style={styles.anchorTopLeft}></View>
        <View style={styles.anchorTopRight}></View>
        <View style={styles.anchorBottomLeft}></View>
        <View style={styles.anchorBottomRight}></View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{quizTitle}</Text>
          <Text style={styles.subtitle}>2KNOW - PHIẾU TRẢ LỜI TRẮC NGHIỆM TỰ ĐỘNG</Text>
        </View>

        {/* Info Box */}
        <View style={styles.studentInfoBox}>
          <View style={{ gap: 10 }}>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Họ và tên:</Text>
              <View style={[styles.infoLine, { width: 150 }]}></View>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Lớp:</Text>
              <View style={[styles.infoLine, { width: 80 }]}></View>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Mã Học Sinh:</Text>
              <View style={styles.infoLine}></View>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>Mã Đề:</Text>
              <View style={[styles.infoLine, { width: 50 }]}></View>
            </View>
          </View>
        </View>

        {/* Note */}
        <Text style={{ fontSize: 10, fontStyle: "italic", marginBottom: 15, textAlign: "center" }}>
          Lưu ý: Dùng bút chì 2B hoặc bút bi xanh/đen tô kín toàn bộ ô tròn của đáp án đã chọn.
        </Text>

        {/* Questions Grid */}
        <View style={styles.grid}>
          {questionNumbers.map((num) => (
            <View key={num} style={styles.questionRow}>
              <Text style={styles.questionNum}>Câu {num}</Text>
              {options.map((opt) => (
                <View key={opt} style={styles.bubble}>
                  <Text style={styles.bubbleText}>{opt}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by 2Know Gamified Assessment Platform • DO NOT mark outside the anchor boxes.
        </Text>
      </Page>

      {/* Trang ghép đề thi Hybrid */}
      {questions && questions.length > 0 && (
        <Page size="A4" style={styles.questionPage} wrap>
          <View style={styles.questionHeader}>
            <Text style={styles.title}>NỘI DUNG ĐỀ THI</Text>
            <Text style={styles.subtitle}>{quizTitle}</Text>
          </View>
          {questions.map((q, i) => {
            const qOptions = q.metadata?.options || q.options || [];
            return (
              <View key={q.id || i} wrap={false} style={{ marginBottom: 15 }}>
                <Text style={styles.questionText}>Câu {i + 1}: {q.content || q.question}</Text>
                {qOptions.map((opt: any, oIdx: number) => {
                  const optText = typeof opt === 'string' ? opt : (opt.content || opt.text || opt.label || "");
                  return (
                    <Text key={opt.id || oIdx} style={styles.optionText}>
                      {String.fromCharCode(65 + oIdx)}. {optText}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        </Page>
      )}
    </Document>
  );
};
