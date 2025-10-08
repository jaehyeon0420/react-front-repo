
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
/*
 zustand : 상태를 애플리케이션 전역으로 관리하기 위한 상태 관리 라이브러리 중 한가지.

 단, zustand만 설치하여 사용하면 전역적으로 데이터 공유가 가능하지만, 
 Ram에 저장되므로 새로 고침을 하게 되면 초기화되면서 데이터 휘발됨.
 middleward를 설치하여 브라우저 Local Storage 저장소에 데이터를 저장할 것임!
 Local Storage에 저장된 데이터는 브라우저를 종료해도 영구적으로 유지됨.
 로그인 시, 전역적으로 공유할 데이터를 Local Storage에 영구적으로 저장해놓고
 사용자 액션(로그아웃 또는 회원탈퇴) 발생 시, 저장된 데이터를 제거

 * 크롬 일반 브라우저랑 시크릿 모드는 localStorage 공유 안함!
   일반 브라우저 접속 및 로그인 후, 브라우저 종료 => 시크릿 모드로 재접속하면 로그인 안되어 있는 상태임!

 * 리액트 프로젝트 종료 및 재실행하면 로그아웃됨! 
   

 * zustand 4.1.0 버전 이후에는 아래의 persist 모듈 따로 설치하지 않아도, zustand에 포함되어 있음.
   import만 진행하여 메소드 사용 가능.

 (1) npm install zustand-persist 설치
 (2) 아래 set을 persist로 감싸기. -> 내부 상태값들이 브라우저의 localStorage에 무기한 유지됨..
 (3) 로그인 시, localStorage에 저장한 refreshToken으로 만료 시간 검증 절차


*/

const useUserStore = create(
  persist(
      (set) => ({
          /*
          isLogined    : 로그인 상태인지 로그아웃 상태인지
          setIsLogined : 외부 컴포넌트에서 로그인 or 로그아웃 시 호출할 함수
          loginMember : 로그인 성공 시 회원 객체
          setLoginMember : 회원 객체 변경 함수
          accessToken : 서버 요청 시, 전송할 토큰
          refreshToken : 액세스 토큰 만료 시, 재발급 용도의 토큰
          */
          isLogined: false, 
          setIsLogined: (loginChk) => set({
            isLogined: loginChk
          }), 
          loginMember : null,
          setLoginMember: (memberObj) => set({
            loginMember : memberObj
          }),
          accessToken : null,
          setAccessToken : (accessToken) => set({
            accessToken: accessToken
          }),
          refreshToken : null,
          setRefreshToken : (refreshToken) => set({
            refreshToken: refreshToken
          }),
      })
  )
)

export default useUserStore;