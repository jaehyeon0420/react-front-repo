
import { useParams } from "react-router-dom";
import createInstance from "../../axios/Interceptor";
import { useEffect, useState } from "react";
import useUserStore from "../../store/useUserStore";
import BoardUpdFrm from "./BoardUpdFrm";
import ToastEditor from "../common/ToastEditor";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
/* BoardUpdate.jsx
     |  
     |
     |
     ------ BoardFrm.jsx 

     - 전체적인 화면 구성은 게시글 등록과 유사.
     - 다른 부분은 화면 진입 시, 기존 데이터들이 표기된다는 것.
     - 또한, BoardWrite.jsx에서 선언했던 State 변수들의 초기값을 기존 데이터로 세팅해야 한다는 점.
     - 현재 컴포넌트에서 가장 먼저 해야할것은, 전달받은 게시글 번호로 게시글 전체 정보를 조회해오기.
     - BoardFrm.jsx 재사용 하기(강의를 위해 BoardUpdFrm.jsx 사용)
     - state 변수들의 선언 위치
        BoardUpdate.jsx에서 수정 요청 시 서버로 전송하거나
        BoardUpdate.jsx에서 기존 정보 조회 시, 응답받은 데이터 중 하위 컴포넌트 BoardFrm.jsx에 
*/

export default function BoardUpdate(){
    const params = useParams();     //BoardView.jsx에서 전달한 게시글 번호 추출
    const boardNo = params.boardNo; 
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();
    
    //수정 대상 정보들 State 변수로 세팅.
    const [boardTitle, setBoardTitle] = useState("");       //게시글 제목
    const [boardThumb, setBoardThumb] = useState(null);     //썸네일 파일 객체 (게시글에 대한 미리보기 이미지)
    const [boardContent, setBoardContent] = useState("");   //게시글 내용
    const [boardFile, setBoardFile] = useState([]);         //첨부파일 (여러개일 수 있으므로 배열)

    //화면에 기존 썸네일, 기존 첨부파일명 보여주기 위한 State
    const [prevThumbPath, setPrevThumbPath] = useState(null);
    const [prevBoardFileList, setPrevBoardFileList] = useState([]);

    //기존 첨부파일 삭제 시, 삭제한 파일번호를 저장할 배열 (DB 및 드라이브에서 지워주기 위해 서버로 전송)
    const [delBoardFileNo, setDelBoardFileNo] = useState([]);

    const {loginMember} = useUserStore();                   //로그인 사용자

    //컴포넌트 랜더링 시, 기존 게시글 정보 조회하여 State 변수에 세팅
    useEffect(function(){
        let options = {};
        options.url = serverUrl + "/boards/" + boardNo; //기존 상세보기 API 재사용
        options.method = 'get';
        
        axiosInstance(options)
        .then(function(res){
            const board = res.data.resData;
            setBoardTitle(board.boardTitle);
            setBoardContent(board.boardContent);

            /* 응답받은 게시글 정보 중, 썸네일은 파일 객체가 아닌 파일명 string 임.
               위에서 선언한 boardThumb와 boardFile은 수정된 파일 '객체'가 들어가야 하므로, 세팅 X
               (등록할때도 화면에 보여주기 위한 State를 따로 만들었던것처럼 이번에도!)
            */
           
           setPrevThumbPath(board.boardThumbPath);   //ex) 20250521170104388_02377.jpg
           setPrevBoardFileList(board.fileList);     //BoardFile 객체 리스트
        })
        .catch(function(error){

        });

    },[]);

    //수정하기
    const navigate = useNavigate();
    function updateBoard(){
        //console.log(boardNo);           //게시글 번호
        //console.log(boardTitle);        //게시글 제목
        //console.log(boardContent);      //게시글 내용
        //console.log(boardThumb);        //new 썸네일(null이면 기존이미지, 첨부했으면 새로운 이미지)
        //console.log(boardFile);         //new 파일 리스트
        //console.log(delBoardFileNo);    //삭제할 파일 번호 리스트
        //console.log(prevThumbPath);     //기존 썸네일 파일명(new 썸네일 등록 시, 기존꺼 서버에서 삭제를 위함)

        if(boardTitle != null && boardContent != null){
            const form = new FormData();
            form.append('boardNo', boardNo);
            form.append('boardTitle', boardTitle);
            form.append('boardContent', boardContent);

            //기존 썸네일 => 서버에서 삭제를 위해 전송
            //기존에 썸네일 등록 안한 경우 null이 문자열로 전송되어 서버에서 "null"로 인식
            if(prevThumbPath != null){
                form.append('prevThumbPath', prevThumbPath);
            }

            //new 썸네일
            if(boardThumb != null){
                form.append('boardThumb', boardThumb);
            }
            //첨부파일 업로드도 존재하는 경우에만. (여러개 같은 이름으로 전송)
            for(let i=0; i<boardFile.length; i++){
                form.append("boardFile", boardFile[i]);
            }
            //삭제할 파일 번호
            for(let i=0; i<delBoardFileNo.length; i++){
                form.append('delBoardFileNo', delBoardFileNo[i]);
            }

            let options = {};
            options.method = 'patch'; //일부 수정 == PATCH
            options.url = serverUrl + "/boards";
            options.data = form;
            options.headers = {};
            options.headers.contentType = "multipart/form-data";
            options.headers.processData = false;

            axiosInstance(options)
            .then(function(res){
                //게시글 수정 여부에 따른 메시지는 서버에서 응답한 객체 내용대로 Interceptor에서 alert 처리.

                navigate("/board/view/" + boardNo);
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

    return (
        <section className="section board-content-wrap">
            <div className="page-title">게시글 수정</div>
            <form className="board-write-frm" onSubmit={function(e){
                e.preventDefault();
                updateBoard();
            }}> 
                {/* 컴포넌트 재사용 */}
                <BoardUpdFrm loginMember={loginMember}
                             boardTitle={boardTitle}
                             setBoardTitle={setBoardTitle}
                             boardThumb={boardThumb}
                             setBoardThumb={setBoardThumb}
                             boardFile={boardFile}
                             setBoardFile={setBoardFile} 
                             /* 추가로, 기존 썸네일과 파일 리스트 전달 */
                             prevThumbPath={prevThumbPath}
                             setPrevThumbPath={setPrevThumbPath}
                             prevBoardFileList={prevBoardFileList}
                             setPrevBoardFileList={setPrevBoardFileList}
                             /* 파일 삭제 시, 삭제 파일 번호 저장할 배열 전달 */
                             delBoardFileNo={delBoardFileNo}
                             setDelBoardFileNo={setDelBoardFileNo}
                             />
                <div className="board-content-wrap">
                    <ToastEditor 
                        boardContent={boardContent} 
                        setBoardContent={setBoardContent} 
                        type={1}/>
                </div>
                <div className="button-zone">
                    <button type="submit" className="btn-primary lg">
                        수정하기
                    </button>
                </div>
            </form>
        </section>
    );
}