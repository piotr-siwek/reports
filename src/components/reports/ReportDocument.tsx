import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define the props for the report document
interface ReportDocumentProps {
  title: string;
  summary: string;
  conclusions: string;
  keyData: string;
}

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: 16,
    marginBottom: 6,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#555',
  },
});

// Create the ReportDocument component using react-pdf
const ReportDocument: React.FC<ReportDocumentProps> = ({ title, summary, conclusions, keyData }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>{title || 'Niezatytułowany Raport'}</Text>
      <View style={styles.section}>
        <Text style={styles.header}>Podsumowanie:</Text>
        <Text style={styles.text}>{summary}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Wnioski:</Text>
        <Text style={styles.text}>{conclusions}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Kluczowe Dane:</Text>
        <Text style={styles.text}>{keyData}</Text>
      </View>
    </Page>
  </Document>
);

export default ReportDocument; 