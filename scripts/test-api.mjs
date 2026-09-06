import { POST } from '../src/app/api/recitation/correct/route';

async function testRecitationAPI() {
  console.log('Testing Recitation API route end-to-end...');

  // Create a minimal dummy audio WAV buffer
  const dummyWavHeader = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
    0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00
  ]);
  const audioBlob = new Blob([dummyWavHeader], { type: 'audio/wav' });

  const formData = new FormData();
  formData.append('audio', audioBlob, 'test.wav');
  formData.append('expectedText', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');

  const req = new Request('http://localhost:3000/api/recitation/correct', {
    method: 'POST',
    body: formData
  });

  const res = await POST(req);
  console.log('Response HTTP Status:', res.status);
  const json = await res.json();
  console.log('Response JSON:', JSON.stringify(json, null, 2));
}

testRecitationAPI().catch(console.error);
