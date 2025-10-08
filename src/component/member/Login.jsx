
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";  
import "./member.css"; 
import useUserStore from "../../store/useUserStore"; //Store import
import createInstance from "../../axios/Interceptor";

export default function Login() {
    //Zustand 사용으로 로그인 관련 State 제거
    const {loginMember, isLogined, setIsLogined, setLoginMember, setAccessToken, setRefreshToken} = useUserStore();

    const navigate = useNavigate();
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const axiosInstance = createInstance();

    //로그인 입력 정보 저장 변수(서버 전송용)
    const [member, setMember] = useState({
        memberId : "",
        memberPw : ""
    });
    //아이디 및 비밀번호 입력 시, 동작 함수
    function chgMember(e){
        member[e.target.name] = e.target.value;
        setMember({...member});
    }

    useEffect(function(){
        //헤더 로그아웃 클릭, MemberInfo 회원정보 수정, MemberPwChg 비밀번호 변경 시, isLogined를 false 처리 후 현재 컴포넌트로 이동함.
        if(!isLogined){
            setLoginMember(null);
        }
    },[]);

    //로그인
    function login(){
        if(member.memberId == '' || member.memberPw == ''){
            Swal.fire({
                title: "알림",
                text : "아이디 또는 비밀번호를 입력하세요.",
                icon : "info",
                confirmButtonText: "확인",
            });

        }else{
            let options = {};
            options.url = serverUrl + "/members/auth/login" ;
            //로그인 == 입력한 아이디 및 비밀번호와 일치하는 회원 조회 == GET??
            //POST :  리소스 생성 또는 서버 상태 변경 시 적절한 메소드
            //보안적인 문제도 존재하고, 인증 정보(토큰)를 생성하는 요청이므로 POST가 적절
            options.method = "POST";
            options.data = member;

            axiosInstance(options)
            .then(function(res){
                
                //null 체크 안해도, 아래 resData.member 추출하다 오류 발생해서 catch로 빠짐.
                if(res.data.resData != null){ 
                    //res.data.resData == LoginMember.java
                    //res.data.resData.member == Member.java
                    const member = res.data.resData.member;

                    /* 로그인 성공 시, 스토어의 isLogined 값 변경*/
                    setIsLogined(true);     
                    setLoginMember(member);
                    
                    // 스토어에 토큰을 저장해놓고, Axios 인터셉터에서, 서버에 요청할때마다 헤더에 토큰 포함을 시키기.
                    setAccessToken(res.data.resData.accessToken);
                    setRefreshToken(res.data.resData.refreshToken);

                    // 로그인 이후, 모든 서버 요청시마다 액세스 토큰을 포함시키는 코드를 작성해야 함.
                    // 컴포넌트에서 서버 요청 액션이 발생하면 해당 요청을 서버로 보내기전에 가로채서
                    // 헤더에 토큰을 포함시키기 위해 axios 인터셉터 작성.
                    
                    navigate("/");
                }
            })
            .catch(function(error){
                
            });
        }
    }

    return (
        <section className="section login-wrap">
            <div className="page-title">로그인</div>
            {/* type=password 포함되어 있을 시, 로그인 후 크롬에서 자동으로 비밀번호 유출 경고 팝업을 띄우는데 autoComplete로 설정 해제 */}
            <form autoComplete="off"
                  onSubmit={function(e){
                      e.preventDefault();
                      login();
            }}>
                <div className="input-wrap">
                    <div className="input-title">
                        <label htmlFor="memberId">아이디</label>
                    </div>
                    <div className="input-item">
                        <input type="text" name="memberId" id="memberId" value={member.memberId} onChange={chgMember}></input>
                    </div>
                </div>
                <div className="input-wrap">
                    <div className="input-title">
                        <label htmlFor="memberPw">비밀번호</label>
                    </div>
                    <div className="input-item">
                        <input type="password" name="memberPw" id="memberPw" value={member.memberPw} onChange={chgMember}></input>
                    </div>
                </div>
                <div className="login-button-box">
                    <button type="submit" className="btn-primary lg">
                        로그인
                    </button>
                </div>
            </form>
        </section>
    );
}