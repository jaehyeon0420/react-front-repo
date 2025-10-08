import { useEffect, useState } from "react";
import createInstance from "../../axios/Interceptor";
import { Link, useNavigate } from "react-router-dom";
import PageNavi from "../common/PageNavi";
import Switch from '@mui/material/Switch';

/*
MUI : MUI(Material-UI)는 리액트(React) 기반의 사용자 인터페이스(UI) 라이브러리
https://mui.com/ : 리액트에서 사용할 수 있는 컴포넌트들을 제공
Products - MUI Core - Material UI - Get Started

(1) 설치 - Toast 에디터랑 충돌나므로, --force 사용하여 강제 설치
    npm install @mui/material @emotion/react @emotion/styled --force
(2) import
(3) label 정의 및 사용

*/
export default function AdminBoard(){
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();

    const [boardList, setBoardList] = useState([]);
    const [reqPage, setReqPage] = useState(1);
    const [pageInfo, setPageInfo] = useState({});

    useEffect(function(){
        //관리 대상 게시글 정보 조회
        let options = {};
        options.url = serverUrl + "/admins/board?reqPage=" + reqPage;
        options.method = 'get';

        axiosInstance(options)
        .then(function(res){
            setBoardList(res.data.resData.boardList);
            setPageInfo(res.data.resData.pageInfo);
        })
        .catch(function(){

        });


        //reqPage 변경 시, useEffect 함수 재동작
    }, [reqPage]);

    

    

    return (
        <>
            <div className="page-title">게시글 관리</div>
            <table className="tbl">
                <thead>
                    <tr>
                        <th style={{width:"10%"}}>글번호</th>
                        <th style={{width:"40%"}}>제목</th>
                        <th style={{width:"15%"}}>작성자</th>
                        <th style={{width:"15%"}}>작성일</th>
                        <th style={{width:"20%"}}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {boardList.map(function(board, index){
                        return <BoardItem key={"board" + index} board={board} index={index} boardList={boardList} setBoardList={setBoardList}/>
                    })}
                </tbody>
            </table>
            <div className="admin-page-wrap" style={{marginTop : "30px"}}>
                {/* 페이지 네비게이션 컴포넌트 별도 분리하여, 필요 시 재사용 */}
                {/* 페이지 네비게이션 제작 후, 페이지 번호 클릭 시 reqPage가 변경되어 요청해야 함 */}
                <PageNavi pageInfo={pageInfo} reqPage={reqPage} setReqPage={setReqPage} />
            </div>
        </>
    );
}

function BoardItem(props) {
    const board = props.board;
    const boardList = props.boardList;
    const setBoardList = props.setBoardList;
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();
    const navigate = useNavigate();
    
    
    function handleChange(e){
        //e.target.checked => 변경 이후 checked 상태값(true or false)
        //boardList[index].boardStatus = e.target.checked ? 1 : 2; //체크는 1(공개), 미체크는 2(비공개)
        
        board.boardStatus = board.boardStatus == 1 ? 2 : 1;
        
        let options = {};
        options.url = serverUrl + '/admins/board';
        options.method = 'patch'; //일부 변경
        options.data = { boardNo : board.boardNo, boardStatus : board.boardStatus };
        
        axiosInstance(options)
        .then(function(res){
            //체크할때마다 변경이 반영된 화면을 보려면, state 변수의 상태를 변경해야 함. -> boardList

            //무조건 화면에 반영 하는것이 아니라, 업데이트 응답이 정상일 때 처리
            if(res.data.resData){
                setBoardList([...boardList]);
            }
        })
        .catch(function(){

        });

    }

    return (
        <tr>
            <td>{board.boardNo}</td>
            <td onClick={function(){
                //URL과 매핑되어 있는 컴포넌트로 이동하며, 게시글 번호 전달.e
                navigate('/board/view/'+board.boardNo);
            }}>{board.boardTitle}</td>
            <td>{board.boardWriter}</td>
            <td>{board.boardDate}</td>
            <td>{/* DB의 상태가 1이면 true로 전달하여 체크. 2면 false 전달하여 미체크 */}
                <Switch checked={board.boardStatus == 1}
                        onChange={handleChange} color="secondary"
                />
            </td>
        </tr>
    );
}