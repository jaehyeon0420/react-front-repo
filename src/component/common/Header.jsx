
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/useUserStore"; //Store import

export default function Header () {
    //Zustand 사용으로 로그인 관련 State 제거
    
    return (
        <header className="header">
            <div>
                <div className="logo">
                    <Link to="/">BAE'S WEB</Link>
                </div>
                <MainNavi />
                <HeaderLink />
            </div>
        </header>
    );
}

function MainNavi () {
    return (
        <nav className="nav">
            <ul>
                 <li>
                    <Link to="/board/list">게시판</Link>
                 </li>
                 <li>
                    <Link to="#">메뉴2</Link>
                 </li>
                 <li>
                    <Link to="#">메뉴3</Link>
                 </li>
                 <li>
                    <Link to="#">메뉴4</Link>
                 </li>
            </ul>
        </nav>
    );
}

function HeaderLink () {
    //스토리지 저장 정보
    const {isLogined, setIsLogined, loginMember, setAccessToken, setRefreshToken} = useUserStore();
    const navigate = useNavigate();
    
    //로그아웃 클릭 시, 동작 함수
    function logout(e){
        e.preventDefault(); //작성하지 않으면 a 태그 기본 이벤트 동작으로, 아래 navigate 동작하지 않음.
        
        /* 
        기존 스토어에 setIsLogined에서 전달값이 false면 loginMember를 null로 만들었음.
        마이페이지(MemberMain.js) 작업 이후, 로그아웃하면 오류 발생함.
        아래 setter로 loginMember를 null로 상태 변경 시, 
        해당 state를 가지고 있는 MemberMain이 리랜더링 되어서..
        로그인에 대한 isLogined만 변경 후, 로그인 컴포넌트에서 처리
        */
       
        setIsLogined(false);
        setAccessToken(null);
        setRefreshToken(null);
        delete axios.defaults.headers.common["Authorization"];

        navigate("/login");
    }

    return (
        <ul className="user-menu">
            { //<></> JSX는 하나로 묶어서!!
            isLogined 
            ? 
                <>
                    <li>
                        <Link to="/member/info">{loginMember.memberId}</Link>
                    </li>
                    <li>
                        <Link to="#" onClick={logout}>로그아웃</Link>
                    </li>                
                </>
            :
                <>
                    <li>
                        <Link to="/login">로그인</Link>
                    </li>
                    <li>
                        <Link to="/join">회원가입</Link>
                    </li>
                </>
            }
        </ul>
    );
}