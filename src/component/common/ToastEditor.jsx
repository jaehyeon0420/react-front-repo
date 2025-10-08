
import "@toast-ui/editor/dist/toastui-editor.css"; 
import {Editor} from "@toast-ui/react-editor";
import { useEffect, useRef } from "react";
import createInstance from "../../axios/Interceptor";

export default function ToastEditor(props){

    const boardContent = props.boardContent;
    const setBoardContent = props.setBoardContent;
    const type = props.type;
    
    //에디터 내용 입력 시, 동작 함수 (boardContent에 set 해주기)
    const editorRef = useRef(null);
    const changeContent = function() {
        //실제 에디터 내용은 HTML 태그로 작성됨.
        const editorData = editorRef.current.getInstance().getHTML();
        setBoardContent(editorData);
    }


    /* 에디터 이미지 업로드 시, 처리 순서
    1) 서버에 비동기 요청하여, 서버에 이미지 업로드
    2) 결과 응답받은 후, 에디터 내부에 이미지 표기.
    */
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const axiosInstance = createInstance();
    function uploadImage(file, callbackFunc){ //이미지 업로드 시, OK 버튼 누르면 파일정보와 호출할 함수 전달해줌.
        //파일 업로드 시, 필수 조건 (POST, multipart/form-data)
        const form = new FormData();
        form.append("image", file);
        
        let options = {};
        options.url = serverUrl + "/boards/editorImage";
        options.method = "post";
        options.data = form;
        options.headers = {};
        options.headers.contentType = "multipart/form-data";
        options.headers.processData = false; //전송 데이터 쿼리 스트링 변환 여부(기본값 true). 폼 데이터 전송 시 false

        axiosInstance(options)
        .then(function(res){
            //Not allowed ~ 오류 발생. 브라우저에서 파일 로드를 보안상 이유로 제한.
            //callbackFunc("C:/Temp/react" + res.data, "이미지");

             {/* 리액트로 생성한 웹 사이트는 정적 웹 사이트. 파일을 받아 브라우저에 보여주는 역할만 하는데
                    파일 업로드는 동적인 처리이므로, 백엔드 서버에 요청해야 함.
                    또한, 리액트로 생성한 정적 웹 사이트는 보안상의 이유로 파일 시스템(C 드라이브 등)에 직접 접근을 할 수 없음.(브라우저에서 제어)
                    파일 시스템에 저장된 이미지를 브라우저에 보여주고자 할 때에도 동일하게 백엔드 서버에 요청해야 함.
                */}

            /*프론트에서 이미지 처리를 하지 못하니 백엔드로 요청해야 함.
              프론트 -> 백 요청. 백엔드는 요청 경로와 파일을 연결시켜줌.
              WebConfig.java에 addResourceHandlers 추가.
            */
            callbackFunc(serverUrl + res.data.resData, "이미지");
        })
        .catch(function(error){

        });
    }


    return (
        <div style={{width : "100%", marginTop : "20px"}}>
            {/* initialValue : 초기값 
                initialEditType : wysiwyg로 하면, HTML 작성 없이 일반 텍스트로 작성 가능.
                                   (글씨 굵게 하면, strong 태그로 감싸지는데, 보여지는건 그냥 글자임)
             */}

            
            { /* type == 0 == 등록
                    (1) boardContent 빈 문자열일 경우, 에디터 기본값이 삽입될 수 있음.
                 type == 1 == 수정
                   (1) BoardUpdate.jsx로 컴포넌트 전환 시, boardContent는 비어있는 상태로 Editor 랜더링
                   (2) BoardUpdate.jsx의 useEffect()에서, 게시글 1개 정보 조회하며, 리랜더링 발생 => boardContent는 기존 내용. 이 때 Editor가 
            */}
            {type == 0 || (type == 1 && boardContent != '')
            ?
             <Editor ref={editorRef}
                      initialValue={boardContent ? boardContent : ' '}
                      initialEditType="wysiwyg"
                      language="ko-KR"
                      height="600px"
                      onChange={changeContent}
                      hooks={{
                        addImageBlobHook : uploadImage
                      }}
                      >
              </Editor>
             : 
             ""}
        </div>
    );
}