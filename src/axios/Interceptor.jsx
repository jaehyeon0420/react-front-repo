// interceptor.js 에서 interceptor 설정

import axios from "axios";
import useUserStore from "../store/useUserStore"; //Store import
import Swal from "sweetalert2";   
import { customHistory } from '../common/history';

// 인스턴스를 생성하고, 인터셉터 설정 로직까지 완료된 후에 새로운 인스턴스를 리턴하는 로직을 
// 하나의 함수로 만들고, createInstance()의 리턴 값(인스턴스)을 이용해서 api를 요청한다.
export default function createInstance() {
	const instance = axios.create();
	return setInterceptors(instance);
}

//매개변수로 axios instance를 전달 받고, 인터셉터 설정 로직을 실행한 후 다시 인스턴스 리턴
function setInterceptors(instance) {

    instance.interceptors.request.use(
        function(config) {
            //로그인 완료 시, 스토어에 저장한 액세스 토큰 추출
            //컴포넌트에서 작성했던, useUserStore()는 컴포넌트 내부에서만 사용 가능. axios 인터셉터는 컴포넌트 외부에 존재
           const accessToken = useUserStore.getState().accessToken;
           if(accessToken != null){
               //모든 axios 요청 헤더에 토큰 삽입(안하면 마이페이지에서 새로고침하면 데이터 날아감)
               config.headers['Authorization'] = accessToken;
           }
           
           return config;
		},
		function(error) {
			// 요청 에러난 경우 실행
			return Promise.reject(error);
		},
	);
    
    //정상 응답 시 : 인터셉터 정상 응답 함수 실행 => 각 컴포넌트 axios then 함수 실행
    //오류 발생 시 : 인터셉터 오류 응답 함수 실행 => 각 컴포넌트 axios catch 함수 실행
	instance.interceptors.response.use(
		function(response) {
            console.log('axios success test');
            if(response.data.clientMsg != undefined && response.data.clientMsg != ''){
                
                Swal.fire({
                    title: "알림",
                    text : response.data.clientMsg, //ResponseDTO.clientMsg
                    icon : response.data.alertIcon  //ResponseDTO.alertIcon
                });
            }
            
			// 200대의 응답 데이터를 이용해 실행
			return response;
		},
		function(error) {
			const originalRequest = error.config; //기존 요청 정보를 담고 있는 객체
            
            if(error.status == 403){ //토큰 시간 만료
                
                if(error.config.headers.refreshToken === undefined //헤더에 refreshToken이 포함되지 않음
                   && !originalRequest._retry                      //재요청이 아닌 경우
                ){
                   
                    //토큰이 만료되었는데 현재 요청에 refreshToken이 포함되지 않음 == accessToken으로 요청한 경우.
                    //refreshToken으로 access 토큰 재발급 요청.

                    //컴포넌트에서 작성했던, useUserStore()는 컴포넌트 내부에서만 사용 가능. axios 인터셉터는 컴포넌트 외부에 존재
                    const loginMember  = useUserStore.getState().loginMember;   //재발급 시, 아이디와 레벨로 발급하므로 필요
                    const refreshToken = useUserStore.getState().refreshToken;  //재발급 요청 시, 리프레시 토큰을 헤더에 세팅

                    let options = {};
                    options.url = import.meta.env.VITE_BACK_SERVER + '/members/refresh';
                    options.method = 'post';
                    options.data = loginMember;                 
                    options.headers = {};
                    options.headers.refreshToken = refreshToken;

                    //토큰 재발급 요청을 보내고, 정상 발급 시 원래 기존 요청 다시 보낼 수 있도록
                    return instance(options)
                           .then(function(res){//accessToken 발급 완료!
                                
                                if(res.data.resData != null){
                                    const reAccessToken = res.data.resData;

                                    //로그인 시, 등록했던 토큰 다시 등록!
                                    useUserStore.getState().setAccessToken(reAccessToken);
    
                                    //기존 요청 헤더에 재발급 받은 액세스 토큰 등록 후, 재요청
                                    originalRequest.headers['Authorization'] = reAccessToken;
                                    originalRequest._retry = true; //무한루프 방지
                                }

                                //원래 요청을 재발급 액세스 토큰으로 재시도
                                return instance(originalRequest);
                                
                            })
                            .catch(function(error){
                                return Promise.reject(error);
                            });

                }else{
                    
                    /* 토큰이 만료되었는데 요청에 refreshToken이 포함됨 == refreshToken도 만료됨. 로그인 만료 처리*/
                    Swal.fire({
                        title: "알림",
                        text : "로그인 기간이 만료되었습니다. 다시 로그인 하세요.",
                        icon : "info",
                        confirmButtonText: "확인",
                    }).then((result) => {
                        if (result.isConfirmed) {
        
                            //Store에 저장된 로그인 회원 정보 및 토큰 정보 삭제
                            //setLoginmember(null)하면, 마이페이지 같은 경우 오류 발생하며 로그인 컴포넌트로 전환되지 않음.(로그인 컴포넌트에서 null 처리 진행)
                            useUserStore.getState().setIsLogined(false);
                            useUserStore.getState().setAccessToken(null);
                            useUserStore.getState().setRefreshToken(null);


                            /* 알림창 띄운 후, Login.jsx 컴포넌트로 전환시키기.
                            - 기존에 스크립트에서 컴포넌트 전환 시, useNavigate라는 React Hook을 사용하였음.
                            - React Hook은 컴포넌트 내부에서만 사용이 가능한 기술. axios Interceptor는 컴포넌트 외부에 존재 => useNavigate 사용 불가.
                            
                            - 컴포넌트 외부에서, 컴포넌트를 전환하려면
                              브라우저 주소창을 자바스크립트로 바꿀 수 있게 해주는 도구인 history를 사용해야 함.
                              history를 이용해 브라우저 URL을 변경하면, 이를 감지하고 등록된 컴포넌트 중, path가 일치하는 컴포넌트를 랜더링 해줌.

                              (1) npm install history --force
                              (2) common/history.js 생성
                              (3) main.jsx에서 기존 BrowserRouter => HistoryRouter 변경
                              (4) 컴포넌트 외부에서 아래와 같이 사용
                            */
                            customHistory.push('/login'); //전달 매개변수는 컴포넌트 라우터 등록 시, 지정한 path 값 
                        }
                    });;
                }
            }else {
                let res = error.response.data; //백엔드에서 응답해준 ResponseDTO
                Swal.fire({
                    title: "알림",
                    text : res.clientMsg,
                    icon : res.alertIcon
                });
            }
            

			return Promise.reject(error);
		},
	);

	return instance;
}