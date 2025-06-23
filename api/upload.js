// 이 파일을 Vercel 프로젝트의 /api/upload.js 경로에 덮어쓰세요.
// 이 코드는 클라이언트(브라우저)의 업로드 요청을 처리하여
// Vercel Blob 스토리지에 안전하게 파일을 저장하는 서버 역할을 합니다.

import { handleUpload } from '@vercel/blob/server';

export const config = {
  runtime: 'edge',
};

// POST 요청이 들어왔을 때 실행될 함수
export default async function POST(request) {
  // body에서 업로드할 파일 정보를 추출합니다.
  const body = await request.json();

  try {
    // handleUpload 함수를 사용하여 업로드 URL을 생성하고 클라이언트에 반환합니다.
    // 이 함수는 Vercel Blob의 보안 설정을 처리해줍니다.
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 이 함수는 토큰이 생성되기 전에 실행됩니다.
        // 특정 사용자만 업로드할 수 있도록 권한을 제어할 수 있습니다.
        // 예: 사용자가 로그인했는지 확인

        return {
          // 업로드된 파일에 대한 추가 정보를 메타데이터로 저장할 수 있습니다.
          // 예: 'userId: "user123"'
          metadata: JSON.stringify({
            // 여기에 원하는 메타데이터를 추가하세요.
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // 파일 업로드가 성공적으로 완료되었을 때 실행됩니다.
        // 데이터베이스에 파일 정보를 기록하거나, 추가적인 처리를 할 수 있습니다.
        console.log('Blob upload completed', blob, tokenPayload);
      },
    });

    // 성공적으로 처리되면 생성된 정보를 클라이언트에 JSON 형태로 응답합니다.
    return new Response(JSON.stringify(jsonResponse), { status: 200 });

  } catch (error) {
    // 에러가 발생하면 에러 메시지를 포함하여 400 상태 코드로 응답합니다.
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 },
    );
  }
}
