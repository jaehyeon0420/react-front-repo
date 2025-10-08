
import Header from './component/common/Header';
import Footer from './component/common/Footer';
import { Route, Routes } from 'react-router-dom';
import Main from './component/common/Main';
import Join from './component/member/Join';
import Login from './component/member/Login';
import MemberMain from './component/member/MemberMain';
import BoardMain from './component/board/BoardMain';
import AdminMain from './component/admin/AdminMain';
/*
  Zustand 사용 이후 코드는 App copy.js와 component copy 폴더 내부에 존재.

  (1) zustand 설치, useUserStore.js 생성 및 작성
  (2) 로그인 성공 시 Store에 저장 및 Header에서 Store 정보 추출하여 동적으로 메뉴 (로그인,마이페이지,로그아웃,회원가입) 변경
  (3) 마이페이지 생성하며, 로그인 시 응답받은 accessToken axios 설정에 추가하여 간단하게 토큰 사용법 확인. (/member Get 요청)
       로그인 시 서버에서 발급받은 토큰을 이후 요청마다 axios의 header에 작성해야 함.
       Store에 저장해놓고 사용할 수 있지만 매번 axios 마다 꺼내고 header에 추가하는 작업해야함.
       axios 요청 시 자동으로 header에 추가될 수 있도록 설정할것임. 로그인 성공 콜백 함수로 이동해서 설정!
  (4) refresh 토큰 이용하여 로그인을 지속적으로 유지하기 위해 저장.
      클라이언트 로그인 요청 -> 서버는 DB 검증 후 토큰(accessToken, refresh) 발급. 
      -> 이후 클라이언트는 요청시마다 accessToken 토큰을 요청 헤더에 포함.
      -> accessToken 토큰의 만료시간은 1시간임. 만료되는 경우(1시간이 지났거나 브라우저 종료 후 재접속 시)
      -> 이 때 서버에서 토큰에 대한 검증이 이루어짐.
        -> accessToken 만료되지 않은 경우 비즈니스 로직 처리.
        -> accessToken이 만료된 경우 403 응답.
          -> refreshToken으로 accessToken 재발급 요청
            -> 정상 재발급 시, Store에 accessToken 재등록
            -> refreshToken도 만료된 경우. 다시 로그인 하도록 처리
  (5) 위 4번을 axios Interceptor에서 처리.
  (6) Header의 로그아웃 시 토큰 초기화
        
*/
function App() {
  /* 로그인 관련 State 모두 삭제.
    App.js, Header.js, Login.js
  */
 
  return (
    <div className="wrap">
      <Header />
      <main className="content">
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/join' element={<Join />} />
          <Route path='/login' element={<Login />} />
          <Route path='/member/*' element={<MemberMain />} /> {/* member로 시작하는 URL은 MemberMain을 라우팅 */}
          <Route path='/board/*' element={<BoardMain />} />
          <Route path='/admin/*' element={<AdminMain />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
