
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import createInstance from "../../axios/Interceptor";
import useUserStore from "../../store/useUserStore"; //Store import
import Swal from "sweetalert2"; 

export default function MemberInfo(){
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();
    const {loginMember, setLoginMember, setIsLogined, setAccessToken, setRefreshToken} = useUserStore();

    //기존 회원 정보 표출 및 수정 정보 입력받아 저장할 변수
    const [member, setMember] = useState({
        memberId : "", memberName : "", memberPhone : "", memberLevel : ""
    });

    //수정 정보 입력 시, 호출 함수.
    function chgMember(e){
        const id = e.target.id; 
        member[id] = e.target.value;
        setMember({...member});
    }


    useEffect(function(){
        //기존 회원 정보 조회
        let options = {};
        options.method = 'get';
        options.url = serverUrl + '/members/' + loginMember.memberId;

        axiosInstance(options)
        .then(function(res){
            setMember(res.data.resData);
        })
        .catch(function(error){
            console.log('memberInfo error');
        });

    }, []);

    function updateMember(){
        Swal.fire({
            title: "알림",
            text : "회원 정보를 수정하시겠습니까?",
            icon : "warning",
            showCancelButton : true,
            confirmButtonText: "수정하기",
            cancelButtonText : "취소"
        }).then(function(res){
            if(res.isConfirmed){ 
                
                //현재 member에는 기존 회원정보와 수정된 정보 모두 존재.
                let options = {};
                options.method = 'patch'; //일부 정보만 수정하니 patch
                options.url = serverUrl + '/members';
                options.data = member;
        
                axiosInstance(options)
                .then(function(res){
                    if(res.data.resData){
                        setLoginMember(member); //스토어 회원 정보 최신화
        
                        //정보 수정 완료 메시지는 서버에서 응답한 객체 내용대로 Interceptor에서 alert 처리.
                    }
                    
                })
                .catch(function(error){
                    console.log('memberInfo error');
                });
            }
        });

    }

    //회원탈퇴 이후, 로그인 컴포넌트로 전환을 위함.
    const navigate = useNavigate();

    function delMember(){
        Swal.fire({
            title: "알림",
            text : "정말 회원을 탈퇴하시겠습니까?",
            icon : "warning",
            showCancelButton : true,
            confirmButtonText: "탈퇴하기",
            cancelButtonText : "취소"
        }).then(function(res){
            if(res.isConfirmed){ //탈퇴하기 클릭 시

                let options = {};
                options.method = 'delete';
                options.url = serverUrl + '/members/' + loginMember.memberId;

                axiosInstance(options)
                .then(function(res){
                    if(res.data.resData){
                        //탈퇴 완료 메시지는 서버에서 응답한 객체 내용대로 Interceptor에서 alert 처리.

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
                    console.log('memberInfo error');
                });
            }
        });
    }
    
    return(
        <> 
            <section className="section member-info-section">
                <div className="page-title">내 정보</div>
                <form onSubmit={function(e){
                    e.preventDefault();

                    //form 태그는 새로고침이 일어나므로 기존 이벤트 제거하고 별도 함수 호출
                    updateMember();
                }}>
                    <table className="tbl my-info" style={{width : "80%", margin : "0 auto"}}>
                        <tbody>
                            <tr>
                                <th style={{width:"20%"}}>아이디</th>
                                <td className="left">{member.memberId}</td>
                            </tr>
                            <tr>
                                <th>
                                    <label htmlFor="memberName">이름</label>
                                </th>
                                <td className="left">
                                    <div className="input-item">
                                        <input type="text" id="memberName" value={member.memberName} onChange={chgMember} />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>
                                    <label htmlFor="memberPhone">전화번호</label>
                                </th>
                                <td className="left">
                                    <div className="input-item">
                                        <input type="text" id="memberPhone" value={member.memberPhone} onChange={chgMember} />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>회원등급</th>
                                <td className="left">
                                    {member.memberLevel == 1 ? "관리자" : "일반회원"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="button-zone">
                        <button type="submit" className="btn-primary lg">정보수정</button>
                        <button type="button" className="btn-secondary lg" onClick={delMember}>회원탈퇴</button>
                    </div>
                </form>
            </section>
        </>
    );
}