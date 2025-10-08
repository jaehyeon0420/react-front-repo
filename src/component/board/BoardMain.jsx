
import { Route, Routes } from "react-router-dom";
import BoardList from "./BoardList";
import BoardWrite from "./BoardWrite";
import "./board.css";
import BoardView from "./BoardView";
import BoardUpdate from "./BoardUpdate";

export default function BoardMain(){
    /*
    - BoardMain 컴포넌트를 생성하는 이유.
    로그인 정보처럼 애플리케이션 전역적으로 관리하기에는 부적합하지만,
    게시글 관리 기능 내부에서 상태를 관리해야 하는 정보가 있다면 state 변수로 선언해야함.
    아래에 작성된 컴포넌트끼리 satet 변수를 공유하기 위해서는 state 변수를 상위 컴포넌트에
    선언해야하는데, BoardMain이 없다면 App.jsx가 상위 컴포넌트 => App.jsx에는 다른 관리 기능 컴포넌트들이
    랜더링 되는 공간이므로 부적합.. 사이에 BoardMian이라는 컴포넌트 생성 및 공유할 state 선언
    */
    return(
        <Routes>
            <Route path="list" element={<BoardList />} />
            <Route path="write" element={<BoardWrite /> } />
            <Route path="view/:boardNo" element={<BoardView />} />
            <Route path="update/:boardNo" element={<BoardUpdate />} />
        </Routes>
    );
}