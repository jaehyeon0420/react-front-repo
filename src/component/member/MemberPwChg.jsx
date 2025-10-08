
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useUserStore from "../../store/useUserStore"; //Store import
import createInstance from "../../axios/Interceptor";
import Swal from "sweetalert2"; 


/* 기존 비밀번호 입력을 받고, 일치 여부에 따라 변경할 비밀번호를 입력 받을 것임.
    단, 입력한 기존 비밀번호가 일치하는지는 서버에서 판단
*/
export default function MemberPwChg(){
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();

    //기존 비밀번호가 일치하는지 서버에 요청하여 확인할 때, 비밀번호 변경할 때 memberId 값이 필요함.
    //loginMember 이외 변수들은 비밀번호 변경 성공 시, 재로그인 유도를 위해 필요.
    const {setIsLogined, loginMember, setAccessToken, setRefreshToken} = useUserStore();

    //아이디, 변경할 비밀번호 저장할 member 객체(서버 전송용)
    const [member, setMember] = useState({memberId : loginMember.memberId, memberPw : ""}); //스토어에 등록된 아이디로 초기값 전달

    //비밀번호 확인값 저장 변수
    const [memberPwRe, setMemberPwRe] = useState("");

    //기존 비밀번호 일치 여부 저장 변수 (false : 기존 비밀번호 입력 요소 생성, true : 새 비밀번호 및 확인값 입력 요소 생성)
    const [isAuth, setIsAuth] = useState(false); 

    //기존 비밀번호, 새 비밀번호 입력 시, 호출 함수
    function chgMemberPw(e){
        member.memberPw = e.target.value;
        setMember({...member});
    }
    //비밀번호 확인 값 입력 시, 호출 함수
    function chgMemberPwRe(e){
        setMemberPwRe(e.target.value);
    }

    //기존 비밀번호 일치성 체크
    function chkPw(){
        //조회 == GET이지만, 비밀번호 같은 민감 정보 포함 => POST
        let options = {};
        options.url = serverUrl + "/members/auth/password-check";
        options.method = "post";
        options.data = member;

        axiosInstance(options)
        .then(function(res){
            //비밀번호 일치 여부에 따른, 메시지는 서버에서 응답한 객체 내용대로 Interceptor에서 alert 처리.
            if(res.data.resData){
                //일치성 여부 저장 변수 변경하여, 새 비밀번호 및 확인값 입력받을 수 있도록 처리
                setIsAuth(true);

                /*기존 비밀번호 일치 => 새 비밀번호 입력 후 변경 시 서버에 memberId, memberPw 전송해야 함.
                  위 member State 재사용하기 위해 memberPw 초기화*/
                member.memberPw = "";
                setMember({...member});

            }else{
                setIsAuth(false);
            }
        })
        .catch(function(error){

        });

    }

    //비밀번호 변경 이후, 컴포넌트 전환을 위함.
    const navigate = useNavigate();

    function updatePw(){
        const regExp = /^[a-zA-Z0-9!@#$]{6,30}$/; //영어 대/소문자와 특수문자
        
        if(!regExp.test(member.memberPw)){
            Swal.fire({
                title: "알림",
                text : "비밀번호는 영어, 숫자, 특수문자(!,@,#,$) 6~30글자 사이로 입력하세요.",
                icon : "warning",
                confirmButtonText: "확인",
            });
            
            return false; //메소드 종료
        }else if(memberPwRe == '' || memberPwRe != member.memberPw) { 
            Swal.fire({
                title: "알림",
                text : "비밀번호가 일치하지 않습니다.",
                icon : "warning",
                confirmButtonText: "확인",
            });

            return false;
        }

        let options = {};
        options.url = serverUrl + "/members/password";
        options.method = "patch"; //tbl_member중, 일부 컬럼만 변경 == patch
        options.data = member;

        axiosInstance(options)
        .then(function(res){
            //비밀번호 변경 완료 여부에 따른 메시지는 서버에서 응답한 ResponseDTO.clientMsg Interceptor에서 alert 처리.
            if(res.data.resData){
                
                /* 스토리지에 저장된 loginMember를 null로 초기화 하는 코드를 아래에 작성하면,
                    마운트 된 컴포넌트 중, loginMember를 사용하는 컴포넌트가 리랜더링 됨. (MemberMain)
                    이 때, MemberMain 컴포넌트에서 loginMember.memberLevel을 참조하려고 하여 오류 발생하므로,
                    loginMember를 초기화하는 코드는 Login 컴포넌트에서 처리.
                */
                setIsLogined(false);
                setAccessToken(null);
                setRefreshToken(null);
                delete axios.defaults.headers.common["Authorization"];

                navigate("/login");
                
            }
        })
        .catch(function(error){

        });

    }

    return(
        <>  <section className="section pwChg-section">
                <div className="page-title">비밀번호 변경</div>
                <div style={{width : "60%", margin : "0 auto"}}>
                    {isAuth 
                    ? 
                    <>
                        <div className="input-wrap" style={{marginBottom : "50px"}}>
                            <div className="input-title">
                                <label htmlFor="newPw">새 비밀번호 입력</label>
                            </div>
                            <div className="input-item">
                                <input type="password" value={member.memberPw} onChange={chgMemberPw} />
                            </div>
                        </div>
                        <div className="input-wrap">
                            <div className="input-title">
                                <label htmlFor="newPwRe">새 비밀번호 확인</label>
                            </div>
                            <div className="input-item">
                                <input type="password" value={memberPwRe} onChange={chgMemberPwRe} />
                            </div>
                        </div>
                        <div className="button-zone">
                            <button type="button" className="btn-primary lg" onClick={updatePw}>
                                변경하기
                            </button>
                        </div>
                    </>
                    : 
                    <>
                        <div className="input-wrap">
                            <div className="input-title">
                                <label htmlFor="oldPw">기존 비밀번호 입력</label>
                            </div>
                            <div className="input-item">
                                <input type="password" value={member.memberPw} onChange={chgMemberPw} />
                            </div>
                        </div>
                        <div className="button-zone">
                            <button type="button" className="btn-primary lg" onClick={chkPw}>
                                확인
                            </button>
                        </div>
                    </>
                    }
                </div>
            </section>
        </>
    );
}