
import { useState } from "react";
import BoardFrm from "./BoardFrm";
import BoardUpdFrm from "./BoardUpdFrm";
import ToastEditor from "../common/ToastEditor";
import useUserStore from "../../store/useUserStore";
import createInstance from "../../axios/Interceptor";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 

/* BoardWrite.jsx
     |  
     |
     |
     ------ BoardFrm.jsx 

     # 게시글 작성 시, 입력 정보를 저장할 State 변수를 BoardWrite.jsx에서 선언하는 이유.
       실제 백엔드 서버에 게시글 작성 요청은 BoardWrite.jsx에서 처리. BoardFrm.jsx는 단순 입력폼 양식을 제공하는 재사용 컴포넌트.
       (1) 작성하기 요청이 BoardWrite.jsx에서 일어나므로
       (2) 만약, BoardFrm.jsx에서 State 변수를 선언한다면, 상위 컴포넌트인 BoardWrite.jsx로 전달할 방법이 없으므로. (스토리지에 저장하는 것은 부적합.)
 */
export default function BoardWrite(){
    const {loginMember} = useUserStore();                   //로그인 사용자

    const [boardTitle, setBoardTitle] = useState("");       //게시글 제목
    const [boardThumb, setBoardThumb] = useState(null);     //썸네일 파일 객체 (게시글에 대한 미리보기 이미지)
    const [boardContent, setBoardContent] = useState("");   //게시글 내용
    const [boardFile, setBoardFile] = useState([]);         //첨부파일 (여러개일 수 있으므로 배열)

    const navigate = useNavigate();

    //게시글 작성 버튼 클릭 동작 함수
    const serverUrl = import.meta.env.VITE_BACK_SERVER;
    const axiosInstance = createInstance();
    function boardWrite(){
        //비동기 통신 시, 서버 요청 데이터에 파일이 포함된 경우 <form> 태그 형식으로 전송해야 하는데
        //동적으로 form 태그를 만들어 전송하는건 파일이 포함되어 있어 불가하고, submit 시 페이지가 전체 리로딩 됨.
        //FormData라는 웹 API를 사용하는것이 훨씬 편리하고 권장되는 방법.
        if(boardTitle != "" && boardContent != ""){
            const form = new FormData();
            
            //"input name 속성 값(식별자)과 같은 역할", 전송 데이터
            form.append("boardTitle", boardTitle);
            form.append("boardContent", boardContent);
            form.append("boardWriter", loginMember.memberId);

            //썸네일 이미지가 첨부된 경우만 추가.
            if(boardThumb != null){
                form.append("boardThumb", boardThumb);
            }
            //첨부파일 업로드도 존재하는 경우에만. (여러개 같은 이름으로 전송)
            for(let i=0; i<boardFile.length; i++){
                form.append("boardFile", boardFile[i]);
            }

            let options = {};
            options.url = serverUrl + "/boards";
            options.method = "post";    //등록, 파일 == POST
            options.data = form;
            options.headers = {};
            options.headers.contentType = "multipart/form-data";
            options.headers.processData = false; //전송 데이터 쿼리 스트링 변환 여부(기본값 true). 폼 데이터 전송 시 false

            axiosInstance(options)
            .then(function(res){
                //게시글 등록 여부에 따른 메시지는 서버에서 응답한 객체 내용대로 Interceptor에서 alert 처리.
                
                navigate("/board/list");
                //이후, BoardList.js에서 썸네일 이미지 표기 처리.
                
            })
            .catch(function(error){

            });
        }else {
            Swal.fire({
                title: "알림",
                text : '게시글 제목과 내용은 필수 입력값입니다.',
                icon : 'warning'
            });
        }
    }

    return(
        <section className="section board-content-wrap">
            <div className="page-title">게시글 작성</div>
            <form className="board-write-frm"
                  onSubmit={function(e){
                    e.preventDefault();

                    boardWrite();
                  }}
            >
                {/* 게시글 작성 형식과 게시글 수정 형식 동일 하므로 내부 내용은 별도 컴포넌트 분리하여 재사용.
                    loginMember는 단순히, 작성하기 폼에서 작성자를 보여주기 위한 역할.
                 */}
                <BoardFrm loginMember={loginMember}  
                          boardTitle={boardTitle}
                          setBoardTitle={setBoardTitle}
                          boardThumb={boardThumb}
                          setBoardThumb={setBoardThumb}
                          boardFile={boardFile}
                          setBoardFile={setBoardFile} />
                {/* JSP/Servlet에서 사용했던, 썸머노트 에디터는 jQuery 필수. 이번에는 다른 에디터 사용.
                    NHN 그룹에서 만듬. 리액트 17번까지만 지원하여, --force로 붙여 강제 설치 (발생하는 문제에 대해서는 개발자가 처리)
                    npm install @toast-ui/react-editor --force

                    에디터도 리액트에서 여러 컴포넌트에서 사용된다면, 별도의 컴포넌트로 제작하는것이 재사용하기 편리.
                */}
                <div className="board-content-wrap">
                    <ToastEditor 
                        boardContent={boardContent} 
                        setBoardContent={setBoardContent} 
                        type={0}/>
                </div>
                <div className="button-zone">
                    <button type="submit" className="btn-primary lg">
                        등록하기
                    </button>
                </div>
            </form>
        </section>
    );
}