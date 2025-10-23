import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


/** 🧭 Helper — Adds professional header */


// BC Form - Single Entry Export with Correct Questions and Scoring
export const exportSingleEntryToPDF = (entry) => {
  const doc = new jsPDF();
    const rightX = 200; // right margin reference (A4 ≈ 210mm)
  doc.setFontSize(8);

  // Right-aligned metadata
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, rightX, 10, { align: "right" });
 

  // Main Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Behavior Checklist (BC) Assessment Report", 105, 15, {
    align: "center",
  });

  // Organization Name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Mathavam Centre for Neuro Developmental Disorders", 105, 22, {
    align: "center",
  })
    // Divider Line
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.8);
  doc.line(20, 26, 190, 26);
  // Title
 

     
  // Patient Information
  doc.setFontSize(12);
  doc.text("Patient Information:", 20, 35);
  doc.setFontSize(10);
  doc.text(`Child Number: ${entry.childNo || "N/A"}`, 20, 45);
  doc.text(`Name: ${entry.name || "N/A"}`, 20,50);
  doc.text(`Age: ${entry.age || "N/A"}`, 20, 55);
  doc.text(`Gender: ${entry.gender || "N/A"}`, 20, 60);
  doc.text(`Assessment Date: ${entry.date || "N/A"}`, 20, 65);
  
  // Assessment Time
  const formatTime = (entry) => {
    try {
      if (entry.createdAt) {
        return new Date(entry.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return "N/A";
    }
  };
  
  doc.text(`Assessment Time: ${formatTime(entry)}`, 20, 70);

  // Correct sections and questions from your form
  const sections = [
    {
      title: 'I. Social Communication',
      key: 'social',
      questions: [
        'Shows appropriate affection towards familiar people',
        'Resists affection from familiar people',
        'Shows inappropriate affection towards unfamiliar people',
        'Responds to attempts to initiate social interaction',
        'Directs facial expression towards other people',
        'Uses common gestures - waves "hello" and "goodbye"',
        'Combines gestures with vocalizations to enhance communication',
        'Looks when he/she is called or praised',
        'Looks where another person is looking or pointing',
        'Has difficulty interacting with peers',
        'Says socially inappropriate things',
        'Attends to parts of sentences and misinterprets whole',
      ],
    },
    {
      title: 'II. Restrictive Behaviors',
      key: 'restrictive',
      questions: [
        'Gets upset over small changes in routine',
        'Resists trying out new things - places, clothes, food, etc.',
        'Is fixated on certain topics or activities and unable to move on',
        'Has an unusually narrow range of interests',
        'Repeats/echoes what others say',
        'Makes repetitive body movements',
      ],
    },
    {
      title: 'III. Mood and Anxiety',
      key: 'mood',
      questions: [
        'Cries over minor annoyances and hurts',
        'Is irritable and whiny',
        'Clings to adults or is too dependent on them',
        'Is anxious in social situations',
        'Is fearful of specific objects or situations',
        'Has sleep problems',
      ],
    },
    {
      title: 'IV. Self-regulation',
      key: 'selfRegulation',
      questions: [
        'Has difficulties waiting his/her turn',
        'Switches quickly from one topic or activity to another',
        'Has difficulties playing or engaging in leisure activities quietly',
        'Fidgets',
        'Has difficulty remaining seated',
        'Is excessively active',
      ],
    },
    {
      title: 'V. Challenging Behavior',
      key: 'challenging',
      questions: [
        'Is verbally aggressive towards other children or adults',
        'Is physically aggressive towards other children or adults',
        'Throws things inappropriately',
        'Runs away',
        'Takes or grabs things that belong to others',
        'Has temper outbursts or tantrum',
      ],
    },
    {
      title: 'VI. Self-injurious Behavior',
      key: 'selfInjury',
      questions: [
        'Engages in head-banging',
        'Engages in arm-biting',
        'Engages in excessive scratching',
        'Engages in hair-pulling',
        'Engages in eye-poking',
        'Engages in other self-injurious behavior',
      ],
    },
  ];

  // Calculate section scores based on your scoring system
  const calculateSectionScore = (sectionKey) => {
    try {
      if (!entry || !entry[sectionKey]) return 0;
      return entry[sectionKey].reduce((sum, score) => {
        const numericScore = parseInt(score);
        // Only count scores that are numbers (1, 2, 3, 5) - exclude NA
        if (!isNaN(numericScore) && score !== 'NA' && score !== '') {
          return sum + numericScore;
        }
        return sum;
      }, 0);
    } catch (err) {
      return 0;
    }
  };

  // Count number of applicable items (excluding NA items)
  const countApplicableItems = (sectionKey) => {
    try {
      if (!entry || !entry[sectionKey]) return 0;
      return entry[sectionKey].reduce((count, score) => {
        const numericScore = parseInt(score);
        if (!isNaN(numericScore) && score !== 'NA' && score !== '') {
          return count + 1;
        }
        return count;
      }, 0);
    } catch (err) {
      return 0;
    }
  };

  const socialScore = calculateSectionScore('social');
  const restrictiveScore = calculateSectionScore('restrictive');
  const moodScore = calculateSectionScore('mood');
  const selfRegulationScore = calculateSectionScore('selfRegulation');
  const challengingScore = calculateSectionScore('challenging');
  const selfInjuryScore = calculateSectionScore('selfInjury');
  
  const totalScore = socialScore + restrictiveScore + moodScore + selfRegulationScore + challengingScore + selfInjuryScore;
  
  const totalApplicableItems = countApplicableItems('social') + countApplicableItems('restrictive') + 
                              countApplicableItems('mood') + countApplicableItems('selfRegulation') + 
                              countApplicableItems('challenging') + countApplicableItems('selfInjury');

  // Section Scores Summary Table
  const sectionData = [
    ['Social Communication', socialScore, countApplicableItems('social'), 12],
    ['Restrictive Behaviors', restrictiveScore, countApplicableItems('restrictive'), 6],
    ['Mood and Anxiety', moodScore, countApplicableItems('mood'), 6],
    ['Self-regulation', selfRegulationScore, countApplicableItems('selfRegulation'), 6],
    ['Challenging Behavior', challengingScore, countApplicableItems('challenging'), 6],
    ['Self-injurious Behavior', selfInjuryScore, countApplicableItems('selfInjury'), 6],
    ['TOTAL SCORE', totalScore, totalApplicableItems, 42]
  ];

  autoTable(doc, {
    startY: 85,
    head: [['Assessment Section', 'Score', 'Items Answered', 'Total Items']],
    body: sectionData,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' }
    }
  });

  // Detailed Questions and Answers
  let currentY = doc.lastAutoTable.finalY + 15;
  
  // Add scoring legend based on your form
  doc.setFontSize(9);
  doc.text("Scoring Scale: 1 (Never) - 2 (Sometimes) - 3 (Often) - 5 (Always) - NA (Not Applicable)", 20, currentY);
  currentY += 10;

  // Function to add section details
  const addSectionDetails = (sectionKey, sectionTitle, questions) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    if (entry[sectionKey] && entry[sectionKey].length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`${sectionTitle}:`, 20, currentY);
      currentY += 7;
      
      const sectionDetails = [];
      entry[sectionKey].forEach((score, index) => {
        if (questions && questions[index]) {
          const question = questions[index];
          const answerText = getAnswerLabel(score);
          sectionDetails.push([`${index + 1}. ${question}`, answerText]);
        }
      });
      
      if (sectionDetails.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Question', 'Response']],
          body: sectionDetails,
          theme: "grid",
          styles: { 
            fontSize: 7,
            cellPadding: 2
          },
          headStyles: { 
            fillColor: [100, 100, 100],
            fontSize: 6
          },
          columnStyles: {
            0: { cellWidth: 140 },
            1: { cellWidth: 20, halign: 'center' }
          },
          margin: { left: 10, right: 10 }
        });
        
        currentY = doc.lastAutoTable.finalY + 10;
      }
    }
  };

  // Helper function to convert score to response label based on your form
  const getAnswerLabel = (score) => {
    const numericScore = parseInt(score);
    if (!isNaN(numericScore)) {
      const responseMap = {
        1: 'Never',
        2: 'Sometimes', 
        3: 'Often',
        5: 'Always'
      };
      return responseMap[numericScore] || score;
    }
    return score === 'NA' ? 'N/A' : score;
  };

  // Add all sections with detailed questions
  sections.forEach(section => {
    addSectionDetails(section.key, section.title, section.questions);
  });

  // Interpretation Section
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }

  
  
 
  // Add detailed scoring explanation
  currentY += 5;
  doc.setFontSize(9);
  doc.text("Scoring Explanation:", 20, currentY);
  currentY += 5;
  doc.setFontSize(8);
  const scaleText = [
    "1 - Almost never (less than 10% of the time)",
    "2 - Occasionally (around 25% of the time)", 
    "3 - Half the time (around 50% of the time)",
    "5 - Almost always (90% of the time or more)",
    "NA - Not Applicable"
  ];
  
  scaleText.forEach(line => {
    doc.text(`• ${line}`, 25, currentY, { maxWidth: 160 });
    currentY += 4;
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text("Confidential Assessment Report - Behavior Checklist (BC)", 
           105, pageHeight - 10, { align: "center" });
  
  // Save the PDF
  const fileName = `BC_${entry.childNo || "unknown"}_${entry.date || "unknown"}.pdf`;
  doc.save(fileName);
};

// Helper function for interpretation based on total score
const getInterpretation = (totalScore) => {
  if (totalScore <= 42) return "Minimal behavioral concerns";
  if (totalScore <= 84) return "Mild behavioral concerns";
  if (totalScore <= 126) return "Moderate behavioral concerns";
  return "Significant behavioral concerns requiring intervention";
};