import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { name, contact, email, details } = await request.json();

    // 입력 데이터 검증
    if (!name || !contact) {
      return new Response(JSON.stringify({ error: '이름과 연락처는 필수 항목입니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 고유한 파일명 생성 (예: ionnft-customer/consultation-1678886400000.json)
    const filename = `ionnft-customer/consultation-${Date.now()}.json`;
    
    // 저장할 데이터 객체 생성
    const data = {
      name,
      contact,
      email: email || 'N/A',
      details: details || 'N/A',
      submittedAt: new Date().toISOString(),
    };

    // Vercel Blob에 JSON 파일로 저장
    // Vercel 프로젝트에 'BLOB_READ_WRITE_TOKEN' 환경 변수가 설정되어 있어야 합니다.
    const blob = await put(filename, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });

    // 성공 응답 반환
    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Vercel Blob 저장 오류:', error);
    return new Response(JSON.stringify({ error: '데이터 저장 중 오류가 발생했습니다.', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
