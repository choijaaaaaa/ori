// 레포지토리 계층에서 "그런 레코드 없음"을 API 라우트에 구분해서 알려주기 위한 에러 타입.
// 관리자가 이미 지운/조작된 id로 다시 조작하려 할 때 500 대신 404를 낼 수 있게 한다.
export class NotFoundError extends Error {}
