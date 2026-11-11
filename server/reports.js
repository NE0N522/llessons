const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('node:path');

const STATUS_LABEL = {
  draft: 'Черновик',
  submitted: 'На проверке',
  returned: 'На доработке',
  accepted: 'Принято',
  not_started: 'Не начато'
};

function excelDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function buildClassWorkbook({ klass, students, assignments, submissions }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Код по полочкам';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.subject = `Журнал класса ${klass.name}`;
  workbook.views = [{ x: 0, y: 0, width: 18000, height: 9000, firstSheet: 0, activeTab: 0 }];

  const journal = workbook.addWorksheet('Журнал', { properties: { defaultRowHeight: 20 } });
  journal.columns = [
    { key: 'student', width: 30 },
    ...assignments.map((assignment, index) => ({ key: `assignment_${index}`, width: Math.min(32, Math.max(16, assignment.title.length + 5)) })),
    { key: 'average', width: 18 }
  ];
  journal.addRow([`Класс: ${klass.name}`, `Учебный год: ${klass.school_year || 'не указан'}`]);
  journal.mergeCells(1, 2, 1, Math.max(2, journal.columnCount));
  journal.getRow(1).font = { bold: true, color: { argb: 'FF18324B' } };
  journal.getRow(1).height = 26;
  journal.addRow(['Ученик', ...assignments.map(assignment => `${assignment.title} · ${assignment.max_score}`), 'Средний балл']);
  const header = journal.getRow(2);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF315C89' } };
  header.alignment = { vertical: 'middle', wrapText: true };
  header.height = 36;
  const byCell = new Map(submissions.map(row => [`${row.student_id}:${row.assignment_id}`, row]));
  students.forEach((student, index) => {
    const excelRow = index + 3;
    const values = [student.full_name];
    assignments.forEach(assignment => {
      const submission = byCell.get(`${student.id}:${assignment.id}`);
      values.push(!submission ? null : submission.status === 'accepted' && submission.score != null
        ? Number(submission.score)
        : STATUS_LABEL[submission.status] || submission.status);
    });
    const averageColumn = assignments.length + 2;
    const firstScore = assignments.length ? 'B' : 'B';
    const lastScore = assignments.length ? journal.getColumn(averageColumn - 1).letter : 'B';
    values.push({ formula: assignments.length ? `IFERROR(AVERAGE(${firstScore}${excelRow}:${lastScore}${excelRow}),"")` : '""' });
    const row = journal.addRow(values);
    row.alignment = { vertical: 'top', wrapText: true };
    row.getCell(averageColumn).numFmt = '0.0';
    assignments.forEach((_, assignmentIndex) => {
      const cell = row.getCell(assignmentIndex + 2);
      if (typeof cell.value === 'number') cell.numFmt = '0.##';
    });
  });
  journal.views = [{ state: 'frozen', xSplit: 1, ySplit: 2, activeCell: 'B3' }];
  journal.autoFilter = { from: { row: 2, column: 1 }, to: { row: Math.max(2, students.length + 2), column: journal.columnCount } };

  const deadlines = workbook.addWorksheet('Сроки и сдачи', { properties: { defaultRowHeight: 20 } });
  deadlines.columns = [
    { width: 30 }, { width: 34 },
    { width: 16 }, { width: 18 },
    { width: 20 }, { width: 13 },
    { width: 46 }
  ];
  deadlines.addRow(deadlines.columns.map(column => column.header));
  const deadlineHeader = deadlines.getRow(1);
  deadlineHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  deadlineHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF315C89' } };
  deadlineHeader.alignment = { vertical: 'middle', wrapText: true };
  deadlineHeader.height = 34;
  for (const assignment of assignments) {
    for (const student of students) {
      const submission = byCell.get(`${student.id}:${assignment.id}`);
      if (!(assignment.target_all || assignment.targeted_student_ids?.includes(Number(student.id)))) continue;
      const row = deadlines.addRow([
        student.full_name, assignment.title, excelDate(assignment.due_at), excelDate(submission?.submitted_at),
        STATUS_LABEL[submission?.status || 'not_started'],
        submission?.score == null ? null : Number(submission.score), submission?.teacher_comment || ''
      ]);
      row.alignment = { vertical: 'top', wrapText: true };
      row.getCell(3).numFmt = 'dd.mm.yyyy';
      row.getCell(4).numFmt = 'dd.mm.yyyy hh:mm';
    }
  }
  deadlines.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }];
  deadlines.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, deadlines.rowCount), column: deadlines.columnCount } };
  return workbook;
}

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function createStudentReport({ student, grades, period }) {
  const fontPath = path.join(__dirname, '..', 'outputs', 'assets', 'fonts', 'NotoSans.ttf');
  const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: true, compress: true, info: { Title: `Отчёт ученика — ${student.full_name}`, Author: 'Код по полочкам', Subject: `Успеваемость ${student.full_name}` } });
  doc.registerFont('Noto', fontPath);
  doc.font('Noto');

  const pageLeft = 40;
  const contentWidth = 515;
  const drawTableHeader = () => {
    const y = doc.y;
    doc.save().rect(pageLeft, y, contentWidth, 25).fill('#315c89').restore();
    doc.fillColor('#ffffff').font('Noto').fontSize(8.5);
    doc.text('Задание', pageLeft + 8, y + 7, { width: 182 });
    doc.text('Отправлено', pageLeft + 194, y + 7, { width: 72 });
    doc.text('Балл', pageLeft + 271, y + 7, { width: 48 });
    doc.text('Комментарий учителя', pageLeft + 325, y + 7, { width: 182 });
    doc.y = y + 31;
    doc.fillColor('#1d2e40');
  };

  doc.fontSize(10).fillColor('#315c89').text('КОД ПО ПОЛОЧКАМ · УСПЕВАЕМОСТЬ', { characterSpacing: 0.6 });
  doc.moveDown(0.5).fontSize(23).fillColor('#172b40').text(student.full_name, { width: contentWidth });
  doc.moveDown(0.25).fontSize(10).fillColor('#526477').text(`${student.class_name || 'Класс не указан'}${student.school_year ? ` · ${student.school_year}` : ''}`);
  doc.moveDown(0.25).fontSize(9).text(`Период: ${period.from ? dateLabel(period.from) : 'за всё время'} — ${period.to ? dateLabel(period.to) : 'по настоящее время'}`);
  const accepted = grades.filter(item => item.status === 'accepted' && item.score != null);
  const average = accepted.length ? accepted.reduce((sum, item) => sum + Number(item.score), 0) / accepted.length : null;
  const maxScore = accepted.reduce((sum, item) => sum + Number(item.max_score || 0), 0);
  doc.moveDown(0.8);
  const summaryY = doc.y;
  doc.roundedRect(pageLeft, summaryY, contentWidth, 50, 8).fill('#eef4fb');
  doc.fillColor('#24394d').fontSize(10).text(`Проверено работ: ${grades.length}`, pageLeft + 14, summaryY + 11, { width: 150 });
  doc.fontSize(15).text(average == null ? 'Средний балл: —' : `Средний балл: ${average.toFixed(1)}`, pageLeft + 185, summaryY + 8, { width: 190 });
  doc.fontSize(8.5).fillColor('#526477').text(average == null ? 'Оценки появятся после проверки работ.' : `Набрано баллов: ${maxScore ? accepted.reduce((sum, item) => sum + Number(item.score), 0) : 0}`, pageLeft + 185, summaryY + 30, { width: 300 });
  doc.y = summaryY + 63;

  if (accepted.length) {
    doc.fontSize(10).fillColor('#24394d').text('Динамика оценок', pageLeft, doc.y);
    doc.moveDown(0.4);
    const chartY = doc.y, chartHeight = 52, gap = accepted.length > 1 ? 5 : 0;
    accepted.slice(-Math.floor(contentWidth / 10)).forEach((grade, index, chartGrades) => {
      const slot = contentWidth / chartGrades.length;
      const width = Math.max(5, Math.min(28, slot * 0.56));
      const height = Math.max(3, chartHeight * Math.max(0, Number(grade.score) || 0) / Math.max(1, Number(grade.max_score) || 1));
      const x = pageLeft + index * slot + (slot - width) / 2;
      doc.roundedRect(x, chartY + chartHeight - height, width, height, 2).fill('#4c74aa');
      doc.fillColor('#6a7b8a').fontSize(6).text(`${Number(grade.score) || 0}`, x - 3, chartY + chartHeight + 3, { width: width + 6, align: 'center' });
    });
    doc.y = chartY + chartHeight + 17;
    doc.x = pageLeft;
  }

  doc.x = pageLeft;
  doc.moveDown(0.5).fontSize(12).fillColor('#24394d').text('Работы и комментарии');
  doc.moveDown(0.4);
  drawTableHeader();
  doc.fontSize(8.5).fillColor('#1d2e40');
  for (const grade of grades) {
    const columns = [
      { x: pageLeft + 8, width: 182, value: grade.title || 'Задание без названия' },
      { x: pageLeft + 194, width: 72, value: dateLabel(grade.submitted_at) },
      { x: pageLeft + 271, width: 48, value: grade.score == null ? '—' : `${grade.score} / ${grade.max_score}` },
      { x: pageLeft + 325, width: 182, value: grade.teacher_comment || 'Комментарий не добавлен.' }
    ];
    const height = Math.max(32, ...columns.map(column => doc.heightOfString(String(column.value), { width: column.width, font: 'Noto', fontSize: 8.5, lineGap: 1 }))) + 12;
    if (doc.y + height > doc.page.height - 45) {
      doc.addPage();
      doc.font('Noto').fontSize(8.5);
      drawTableHeader();
    }
    const rowY = doc.y;
    doc.save().rect(pageLeft, rowY, contentWidth, height).fill(grades.indexOf(grade) % 2 ? '#ffffff' : '#f5f8fb').restore();
    for (const column of columns) doc.fillColor('#263849').font('Noto').fontSize(8.5).text(String(column.value), column.x, rowY + 6, { width: column.width, lineGap: 1 });
    doc.moveTo(pageLeft, rowY + height).lineTo(pageLeft + contentWidth, rowY + height).strokeColor('#dce4ec').lineWidth(0.45).stroke();
    doc.y = rowY + height;
  }
  if (!grades.length) doc.fontSize(9).fillColor('#526477').text('В выбранном периоде проверенных работ нет.');
  doc.x = pageLeft;
  doc.moveDown(1).fontSize(7.5).fillColor('#718194').text('Отчёт сформирован автоматически. Данные о работах сохранены в журнале ученика.', { width: contentWidth, align: 'left' });
  return doc;
}

module.exports = { buildClassWorkbook, createStudentReport };
