import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import WorkSansSemiBold from '../../assets/fonts/WorkSans-SemiBold.ttf';

// Rejestracja fontu Work Sans z obsługą polskich znaków
Font.register({
  family: 'WorkSans',
  fonts: [
    { src: WorkSansSemiBold },
  ],
});

// Definicja props dla dokumentu raportu
interface ReportDocumentProps {
  title: string;
  summary: string;
  conclusions: string | string[];
  keyData: string;
}

// Style dla dokumentu PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#f5f5f5',
    fontFamily: 'WorkSans',
    fontWeight: 'normal',
  },
  title: {
    fontFamily: 'WorkSans',
    fontWeight: '600',
    fontSize: 26,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1pt solid #ddd',
  },
  header: {
    fontFamily: 'WorkSans',
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 10,
    color: '#007BFF',
  },
  text: {
    fontFamily: 'WorkSans',
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 1.6,
    color: '#333',
  },
  listItem: {
    fontFamily: 'WorkSans',
    fontWeight: 'normal',
    fontSize: 13,
    marginBottom: 6,
    paddingLeft: 10,
    color: '#333',
  },
});

// Komponent ReportDocument
const ReportDocument: React.FC<ReportDocumentProps> = ({
                                                         title,
                                                         summary,
                                                         conclusions,
                                                         keyData,
                                                       }) => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{title || 'Niezatytułowany Raport'}</Text>

        <View style={styles.section}>
          <Text style={styles.header}>Podsumowanie:</Text>
          <Text style={styles.text}>{summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Wnioski:</Text>
          {
            typeof conclusions === 'string' ? (
              <Text style={styles.text}>{conclusions}</Text>
            ) : (
              conclusions.map((item, idx) => (
                <Text key={idx} style={styles.listItem}>• {item}</Text>
              ))
            )
          }
        </View>

        <View style={styles.section}>
          <Text style={styles.header}>Kluczowe Dane:</Text>
          <Text style={styles.text}>{keyData}</Text>
        </View>
      </Page>
    </Document>
);

export default ReportDocument;