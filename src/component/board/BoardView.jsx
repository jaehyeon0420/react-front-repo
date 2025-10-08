
import { Link, useNavigate, useParams } from "react-router-dom";
import createInstance from "../../axios/Interceptor";
import { useEffect, useState } from "react";
import { Viewer } from "@toast-ui/react-editor";
import useUserStore from "../../store/useUserStore";
import Swal from "sweetalert2"; 

export default function BoardView(){
    const params = useParams();     //BoardList.jsx에서 클릭 시, URL 뒤에 전달한 게시글 번호 추출
    const boardNo = params.boardNo;
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();
    const [board, setBoard] = useState({});
    const {loginMember} = useUserStore();
    const navigate = useNavigate();

    useEffect(function(){
        let options = {};
        options.url = serverUrl + "/boards/" + boardNo;
        options.method = 'get'; //조회 == GET

        axiosInstance(options)
        .then(function(res){
            setBoard(res.data.resData);
        })
        .catch(function(error){

        });

    }, []);

    //게시글 삭제
    function deleteBoard(){
        let options = {};
        options.url = serverUrl + "/boards/" + board.boardNo;
        options.method = "delete"; //삭제 == delete

        axiosInstance(options)
        .then(function(res){
            //게시글 삭제 여부에 따른 메시지는 서버에서 응답한 객체 내용대로 Interceptor에서 alert 처리.
            //삭제 후, 게시글 리스트로 이동
            navigate("/board/list");

        })
        .catch(function(error){
        });
    }


    return (
        <section className="section board-view-wrap">
            <div className="page-title">게시글 상세 보기</div>
            <div className="board-view-content">
                <div className="board-view-info">
                    <div className="board-thumbnail">
                        {/* 리액트로 생성한 정적 웹 사이트는 보안상의 이유로 파일 시스템(C 드라이브 등)에 직접 접근을 할 수 없음.(브라우저에서 제어)
                            파일 시스템에 저장된 이미지를 브라우저에 보여주고자 할 때에도 동일하게 백엔드 서버에 요청해야 함.
                        */}
                        <img src={
                            board.boardThumbPath
                            ? serverUrl+"/board/thumb/" + board.boardThumbPath.substring(0,8) + "/" + board.boardThumbPath
                            : "/images/default_img.png"
                        } />
                    </div>
                    <div className="board-view-preview">
                        <table className="tbl">
                            <tbody>
                                <tr>
                                    <th colSpan={4}>
                                        제목
                                    </th>
                                </tr>
                                <tr>
                                    <td className="left" colSpan={4}>
                                        {board.boardTitle}
                                    </td>
                                </tr>
                                <tr>
                                    <th style={{width:"20%"}}>작성자</th>
                                    <td style={{width:"20%"}}>{board.boardWriter}</td>
                                    <th style={{width:"20%"}}>작성일</th>
                                    <td style={{width:"20%"}}>{board.boardDate}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="file-title">첨부파일</p>
                        <div className="file-zone">
                            {
                            board.fileList 
                            ? 
                            board.fileList.map(function(file, idx){
                                return <FileItem key={"file"+idx} file={file} />;
                            })
                            : ""}
                        </div>
                    </div>
                </div>
                {/* 에디터에서 등록 시, HTML 코드 삽입되어 등록됨.
                    태그를 문자가 아니라 태그로서 동작시키기 위한 속성 사용법
                    <div className="board-content-wrap" dangerouslySetInnerHTML={{__html : board.boardContent }}>
                    </div>
                    단, 태그에 악성 스크립트 삽입 위험이 있어 사용하지 않을 것임.
                    ToastEditor에서 Viewer를 제공하는데, 이걸 사용해서 콘텐츠 보여주기
                */}
                <hr/>
                <div className="board-content-wrap">
                    {board.boardContent 
                    ? <Viewer initialValue={board.boardContent} />
                    : ""}
                </div>
                {
                loginMember != null && loginMember.memberId == board.boardWriter
                ? <div className="view-btn-zone">
                     <Link to={"/board/update/" + board.boardNo} className="btn-primary lg">수정</Link>
                     <button type="button" className="btn-secondary lg" onClick={deleteBoard}>삭제</button>
                  </div>
                : ""} 
            </div>
        </section>
    );
}

function FileItem(props) {
    const file = props.file;
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();

    function fileDown(){
        let options = {};
        options.method = 'get';
        options.url = serverUrl + "/boards/file/" + file.filePath;
        /*
        지금까지 axios 요청의 응답 데이터는 JSON.  res.data로 접근하였음.
        파일 다운로드 요청 시, 응답 데이터(res.data)는 JSON이 아니라 파일(바이너리) 형태.
        서버에서 응답 받은 데이터를 브라우저는 자동 다운로드 하지 않아, 가상의 A 태그를 만들고 클릭하여
        브라우저에 다운로드를 요청할것임.
        */
       options.responseType = 'blob';

        axiosInstance(options)
        .then(function(res){
            const fileData = res.data;
            const blob = new Blob([fileData]); //응답데이터 Blob으로. 꼭 배열로 넣어주어야 함.

            /* 다운로드 받은 바이너리(Blob) 데이터를 다운로드 하기 위해선, 브라우저에 URL로 요청해야 함.*/
            const url = window.URL.createObjectURL(blob);

            //가상의 A 태그 생성하고, 화면에서는 숨김
            const link = document.createElement('a');
            link.href = url;
            link.style.display = "none";
            link.setAttribute('download', file.fileName);//다운로드할 파일 이름 설정
            document.body.appendChild(link);
            link.click();  //링크를 클릭하여 다운로드 시작
            link.remove(); //다운로드 후 링크 요소 제거

            //URL 정보 삭제
            window.URL.revokeObjectURL(url);
        })
        .catch(function(error){

        });
    }

    return (
        <div className="board-file">
            <span className="material-icons file-icon" onClick={fileDown}>file_download</span>
            <span className="file-name">{file.fileName}</span>
        </div>
    );
}