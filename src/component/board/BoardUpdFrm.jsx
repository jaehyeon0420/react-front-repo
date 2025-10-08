
/* BoardFrm.js 컴포넌트는 
   게시글 등록(BoardWrite.js)과, 게시글 수정(BoardUpdate.js)에서 재사용하지만
   강의를 위해, 이 컴포넌트 추가로 만들어 게시글 수정 시 변경 및 추가된 부분에 주석 작성
*/

import { useRef, useState } from "react";


export default function BoardFrm(props){
    const loginMember = props.loginMember;
    const boardTitle = props.boardTitle;
    const setBoardTitle = props.setBoardTitle;
    const boardThumb = props.boardThumb;
    const setBoardThumb = props.setBoardThumb;
    const boardFile = props.boardFile;
    const setBoardFile = props.setBoardFile;

    /* 수정일 때 추가로 컴포넌트로 전달되는 기존 썸네일 파일 명칭
       기존 화면에 보여주기 위한 thumbImg State의 초기값에 세팅할 수 없음.
       thumbImg는 파일의 Base64 데이터를 세팅. props로 전달받은건 단순 파일 명칭.
       별도의 State를 생성하여 조건식에 의해 파일을 보여줄것임.
    */

    //기존 썸네일 파일명 저장 변수
    const prevThumbPath = props.prevThumbPath;
    const setPrevThumbPath = props.setPrevThumbPath;

    //기존 파일 리스트 (BoardFile 객체 리스트)
    const prevBoardFileList = props.prevBoardFileList;
    const setPrevBoardFileList = props.setPrevBoardFileList;

    //삭제 대상 파일 저장 변수
    const delBoardFileNo = props.delBoardFileNo;
    const setDelBoardFileNo = props.setDelBoardFileNo;

    const serverUrl = 'http://localhost:9999';

    //제목 입력 시, 동작 함수
    function chgBoardTitle(e){
        setBoardTitle(e.target.value);
    }   

//# 썸네일 처리

    //썸네일 이미지 미리보기용 State (서버로 데이터 전송 X)
    const [thumbImg, setThumbImg] = useState(null); //수정 시, 새 업로드한 썸네일 이미지
    const thumbFileEl = useRef(null);  //input type=file

    //썸네일 이미지 파일 업로드 시, 동작 함수
    function chgThumbFile(e){
        
         /* e.target : 이벤트가 발생한 요소
           e.currentTarget : 이벤트 핸들러가 연결된 요소

           현재 JSX 구조에서는 모두 동일한 요소를 가르키지만, 여러 요소가 겹쳐있을 때에는 다른 요소를 가르키므로 적절히 사용할 것.
        */
        const files = e.target.files;
        
        if(files.length != 0 && files[0] != null){
            
            //게시글 작성 클릭 시, 썸네일 파일 서버로 전송하기 위해 상위 컴포넌트에서 전달 받은 setter 함수에 파일 객체 전달.
            setBoardThumb(files[0]);

            //화면에 썸네일 이미지 보여주기
            //사용자가 파일 업로드하면, 브라우저의 샌드 박스라는 임시 저장 영역에 업로드 됨. 해당 파일 객체 읽어오기
            const reader = new FileReader(); //브라우저 내에서 파일을 비동기적으로 읽을 수 있게 해주는 객체
            reader.readAsDataURL(files[0]);  //파일 데이터 읽어오기(Base64로 인코딩된 형식 데이터)
            reader.onloadend = function(){   //다 읽어오면, 읽어온 데이터 세팅
                setThumbImg(reader.result);  //미리보기용 State 변수에 세팅하여, 컴포넌트 재랜더링
            }
        }else{
            
            //업로드 팝업에서 취소 버튼 클릭 시, new 썸네일 정보 제거하여, 기존 썸네일 표기
            setBoardThumb(null);   //서버에 전송될 파일 객체 저장 State
            setThumbImg(null);     //화면에 이미지 미리보기용 저장 State
        }
    }

//# 첨부파일 처리

    //첨부파일 업로드 시, 화면에 업로드 파일명칭 목록 보여주기 위한 State (서버로 데이터 전송 X)
    const [boardFileImg, setBoardFileImg] = useState([]);
    //첨부파일 업로드 시, 동작 함수
    function chgBoardFile(e){
        const files = e.currentTarget.files;    //콘솔에는 배열처럼 보이지만 유사 배열이라 map 함수 사용못함.
        const fileArr = new Array();            //게시글 작성 시, 서버로 전송할 파일 객체's 배열
        const fileNameArr = new Array();        //화면에 노출시킬 파일 이름 문자열 배열
        for(let i=0; i<files.length; i++){
            fileArr.push(files[i]);
            fileNameArr.push(files[i].name);
        }

        //전송할 파일 배열과 화면에 보여줄 파일 이름 배열에 복사하며 요소 추가.
        /* fileArr, fileNameArr 앞에 전개 연산자 생략하면, 배열 자체가 하나의 요소로 추가됨.
           
           let aArr = ['a', 'b'];
           let bArr = ['c', 'd'];

           [...aArr, bArr]  =>   ['a', 'b', ['c', 'd']]  => X
           [...aArr, ...bArr]  =>   ['a', 'b', 'c', 'd'] => O
        */
        setBoardFile([...boardFile, ...fileArr]);
        setBoardFileImg([...boardFileImg, ...fileNameArr]);
    }

    return (
        <div>
            <div className="board-thumb-wrap">
                {/* 조건식 : new 썸네일 이미지 => 기존 썸네일 이미지*/
                thumbImg
                ?  
                <img src={thumbImg} onClick={function(){
                    thumbFileEl.current.click(); //아래 input type=file 클릭
                }}/> 
                : 
                    prevThumbPath
                    ?   
                    <img src={serverUrl + "/board/thumb/" + prevThumbPath.substring(0,8) + "/" + prevThumbPath} onClick={function(){
                        thumbFileEl.current.click(); //아래 input type=file 클릭
                    }}/> 
                    :
                    <img src="/images/default_img.png" onClick={function(){
                        thumbFileEl.current.click(); //아래 input type=file 클릭
                    }}/>}
                
                <input type="file" accept="image/*" style={{display:"none"}} ref={thumbFileEl} onChange={chgThumbFile}/>
            </div>
            <div className="board-info-wrap">
                <table className="tbl">
                    <tbody>
                        <tr>
                            <th style={{width : "30%"}}>
                                <label htmlFor="boardTitle">제목</label>
                            </th>
                            <td>
                                <div className="input-item">
                                    <input type="text" id="boardTitle" 
                                           name="boardTitle" value={boardTitle} 
                                           onChange={chgBoardTitle} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>작성자</th>
                            <td className="left">{loginMember.memberId}</td>
                        </tr>
                        <tr>
                            <th>
                                <label>첨부파일</label>
                            </th>
                            <td className="left">
                                <label htmlFor="boardFile" className="btn-primary sm">파일첨부</label>
                                <input type="file" id="boardFile" style={{display:"none"}} onChange={chgBoardFile} multiple />
                            </td>
                        </tr>
                        <tr>
                            <th>첨부파일 목록</th>
                            <td>
                                <div className="board-file-wrap">
                                    {
                                    prevBoardFileList 
                                    ? 
                                        prevBoardFileList.map(function(oldFile, idx){
                                            function deleteFile(){
                                                const newFileList = prevBoardFileList.filter(function(file, idx){
                                                    //삭제 클릭한 요소와 다른 요소들로만 구성된 배열 새로 생성
                                                    return oldFile != file;
                                                });
                                                setPrevBoardFileList(newFileList);

                                                //삭제 파일 번호 추가
                                                setDelBoardFileNo([...delBoardFileNo, oldFile.boardFileNo]);
                                            }

                                            return <p key={"old-file" + idx}>
                                                        <span className="fileName">{oldFile.fileName} </span>
                                                        <span className="material-icons del-file-icon"
                                                        onClick={deleteFile}
                                                        >
                                                            delete
                                                        </span>
                                                </p>;
                                        })
                                    : 
                                        "" 
                                    }

                                    {/* 파일 이름 배열 순회 */}
                                    {boardFileImg.map(function(fileName, idx){
                                        //파일 이름 배열 각 요소마다 적용될 함수
                                        function deleteFile(){
                                            //파일 이름 배열뿐만 아니라, 파일 배열에서도 지워주어야 함. idx번째부터 1개 삭제
                                            boardFile.splice(idx, 1);
                                            setBoardFile([...boardFile]);
                                            boardFileImg.splice(idx,1);
                                            setBoardFileImg([...boardFileImg]);
                                        }    

                                        return <p key={"new-file" + idx}>
                                                    <span className="fileName">{fileName} </span>
                                                    <span className="material-icons del-file-icon"
                                                    onClick={deleteFile}>
                                                        delete
                                                    </span>
                                               </p>;
                                    })}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}