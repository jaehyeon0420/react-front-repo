
import { useEffect, useState } from "react";
import createInstance from "../../axios/Interceptor";
import PageNavi from "../common/PageNavi";
import useUserStore from "../../store/useUserStore";
import { Link, useNavigate } from "react-router-dom";

export default function BoardList(){
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();

    const [boardList, setBoardList] = useState([]); //게시글 리스트
    const [reqPage, setReqPage] = useState(1);      //요청 페이지
    const [pageInfo, setPageInfo] = useState({});   //페이지 네비게이션
    const {isLogined} = useUserStore();             //로그인 여부(작성하기 버튼 표출 여부용)

    useEffect(function(){
        let options = {};
        options.url = serverUrl + "/boards?reqPage=" + reqPage;
        options.method = 'get'; //조회 == GET
        
        axiosInstance(options)
        .then(function(res){
            //응답 게시글 리스트
            setBoardList(res.data.resData.boardList);
            //응답 페이지 네비게이션
            setPageInfo(res.data.resData.pageInfo);
        })
        .catch(function(error){
            console.log(error);
        });

        
    },[reqPage]); //reqPage 변경 시, useEffect 함수 재호출

    return(
        <section className="section board-list">
            <div className="page-title">자유게시판</div>

            {isLogined 
            ?   <div className="write-btn">
                    <Link to="/board/write" className="btn-primary">글쓰기</Link>
                </div>
            : null
            }
            <div className="board-list-wrap">
                <ul className="posting-wrap">
                    {boardList.map(function(board, idx){
                        return (
                            <BoardItem key={"board"+idx} board={board} serverUrl={serverUrl}/>
                        )
                    })}
                </ul>
            </div>
            <div className="board-paging-wrap">
                {/* 페이지 네비게이션 컴포넌트 별도 분리하여, 필요 시 재사용 */}
                {/* 페이지 네비게이션 제작 후, 페이지 번호 클릭 시 reqPage가 변경되어 요청해야 함 */}
                <PageNavi pageInfo={pageInfo} reqPage={reqPage} setReqPage={setReqPage} />
            </div>
        </section>
    )
}

function BoardItem(props) {
    const board = props.board;
    const serverUrl = props.serverUrl;
    const navigate = useNavigate();

    return (
        <li className="posting-item" onClick={function(){
            //URL과 매핑되어 있는 컴포넌트로 이동하며, 게시글 번호 전달.
            navigate('/board/view/'+board.boardNo);
        }}>
            <div className="posting-img">
                {/* 리액트로 생성한 웹 사이트는 정적 웹 사이트. 파일을 받아 브라우저에 보여주는 역할만 하는데
                    파일 업로드는 동적인 처리이므로, 백엔드 서버에 요청해야 함.
                    또한, 리액트로 생성한 정적 웹 사이트는 보안상의 이유로 파일 시스템(C 드라이브 등)에 직접 접근을 할 수 없음.(브라우저에서 제어)
                    파일 시스템에 저장된 이미지를 브라우저에 보여주고자 할 때에도 동일하게 백엔드 서버에 요청해야 함.
                */}
                <img src={board.boardThumbPath 
                    ? serverUrl+ "/board/thumb/" + board.boardThumbPath.substring(0, 8) + "/" + board.boardThumbPath
                    : "/images/default_img.png"} />
            </div>
            <div className="posting-info">
                <div className="posting-title">{board.boardTitle}</div>
                <div className="posting-sub-info">
                    <span>{board.boardWriter}</span> 
                    <span>{board.boardDate}</span>
                </div>
            </div>
        </li>
    );
}