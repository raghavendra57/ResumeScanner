const pdfParse = require('pdf-parse');

function testDebug() {
  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 612 792 ] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const stream = 'BT /F1 12 Tf 72 712 Td (John Doe - Senior Software Engineer with Java, Python, React, SQL, Git) Tj ET';
  const streamLen = Buffer.byteLength(stream, 'utf8');
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  let offset = 0;
  const offsets = [];
  function add(s) {
    const o = offset;
    offset += Buffer.byteLength(s, 'utf8');
    return o;
  }

  const o0 = add(header);
  const o1 = add(obj1);
  const o2 = add(obj2);
  const o3 = add(obj3);
  const o4 = add(obj4);
  const o5 = add(obj5);

  const startxref = offset;
  const pad = (n) => n.toString().padStart(10, '0');
  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(o1)} 00000 n \n${pad(o2)} 00000 n \n${pad(o3)} 00000 n \n${pad(o4)} 00000 n \n${pad(o5)} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const total = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  const buf = Buffer.from(total, 'utf8');

  console.log('Offsets:', { o1, o2, o3, o4, o5, startxref });
  console.log('Byte at o1 (', o1, '):', JSON.stringify(total.substring(o1, o1 + 10)));
  console.log('Byte at o2 (', o2, '):', JSON.stringify(total.substring(o2, o2 + 10)));
  console.log('Byte at o3 (', o3, '):', JSON.stringify(total.substring(o3, o3 + 10)));
  console.log('Byte at o4 (', o4, '):', JSON.stringify(total.substring(o4, o4 + 10)));
  console.log('Byte at o5 (', o5, '):', JSON.stringify(total.substring(o5, o5 + 10)));
  console.log('Byte at startxref (', startxref, '):', JSON.stringify(total.substring(startxref, startxref + 10)));

  return buf;
}

const buf = testDebug();
pdfParse(buf)
  .then(res => {
    console.log('SUCCESS! Text extracted:', res.text);
  })
  .catch(err => {
    console.error('Error:', err);
  });
