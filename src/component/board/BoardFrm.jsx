
/* BoardFrm.js 컴포넌트는 
   게시글 등록(BoardWrite.js)과, 게시글 수정(BoardUpdate.js)에서 재사용하지만
   강의를 위해, 이 컴포넌트는 게시글 등록시에만 사용.
*/

import { useRef, useState } from "react";


export default function BoardFrm(props){

    const loginMember = props.loginMember;
    const boardTitle = props.boardTitle;
    const setBoardTitle = props.setBoardTitle;
    const boardThumb = props.boardThumb;                    //게시글에 대한 썸네일 파일 
    const setBoardThumb = props.setBoardThumb;              //게시글에 대한 썸네일 파일 변경 호출 함수
    const boardFile = props.boardFile;
    const setBoardFile = props.setBoardFile;

    //제목 입력 시, 동작 함수
    function chgBoardTitle(e){
        setBoardTitle(e.target.value);
    }   

//# 썸네일 처리

    //썸네일 이미지 미리보기용 State (서버로 데이터 전송 X)
    const [thumbImg, setThumbImg] = useState(null);

    /* <img> 클릭 시, 썸네일 업로드를 위해 type=file 요소가 클릭되도록 처리하기 위해,
       요소와 자바스크립트 변수와 연결하여 사용할 수 있는 useRef 사용. 

      - React는 Real Document 접근을 권고하지 않음.(document.getElementById..)
      - 가상 Document에 접근하는 방법을 Hook을 통해 제공한다. => useRef
      - useRef와, 요소를 연결해 사용 (태그의 ref 속성에 변수 명칭 작성)

      useState(상태 관리)와 useRef(DOM 조작) 차이.
      - 두 Hook의 가장 큰 차이점은 랜더링 차이!
        1) input요소와 State 연결 및 onChange에서 setState => 키보드 입력시마다 컴포넌트 리랜더링
        2) input요소와 Ref 연결 => 랜더링과 관련이 없어, 리랜더링이 일어나지 않음
      - 랜더링 횟수만 보면, Ref를 사용하는게 비용 측면에서 효율적으로 생각되어 짐.
        하지만 단순히 랜더링 횟수만으로 useRef만을 사용해야하는가? 보다는 
        랜더링에 소요되는 비용이 고비용인가? input은 상태로서 관리해야 하는가?를 생각보아야 함.
      - useRef는 항상 최신값을 바라봄. useState는 비동기적으로 동작해서 setState 이후에 값 출력 시 변경 이전의 값을 출력함.
      - 결론적으로 useState는 컴포넌트 생명주기와 관련되므로, 각 상황에 맞게 적절한 Hook 사용할 것
    */
    
    const thumbFileEl = useRef(null); 

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
            const reader = new FileReader();//브라우저 내에서 파일을 비동기적으로 읽을 수 있게 해주는 객체
            reader.readAsDataURL(files[0]); //파일 데이터 읽어오기(Base64로 인코딩된 형식 데이터)
            reader.onloadend = function(){  //다 읽어오면, 읽어온 데이터 세팅
                setThumbImg(reader.result); //미리보기용 State 변수에 세팅하여, 컴포넌트 재랜더링
            }
        }else{
            //업로드 팝업에서 취소 버튼 클릭 시, 썸네일 파일 제거
            setBoardThumb(null);   //서버에 전송될 파일 객체 저장 State
            setThumbImg(null);     //화면에 이미지 미리보기용 저장 State
        }
    }


//# 첨부파일 처리

    //첨부파일 업로드 시, 화면에 업로드 파일명칭 목록 보여주기 위한 State (서버로 데이터 전송 X)
    const [boardFileImg, setBoardFileImg] = useState([]); //input type=file 요소 속성이 multiple 이므로 배열로 선언
    //첨부파일 업로드 시, 동작 함수
    function chgBoardFile(e){
        const files = e.currentTarget.files;//콘솔에는 배열처럼 보이지만 유사 배열이라 map 함수 사용못함.
        const fileArr = new Array();        //게시글 작성 시, 서버로 전송할 파일 객체's 배열
        const fileNameArr = new Array();    //화면에 노출시킬 파일 이름 문자열 배열
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
                {/* 썸네일 이미지도, type=file input으로 업로드를 해야 함. accept는 이미지 파일만 업로드 가능하도록 제한.
                    화면에서 input type=file 숨기고, 기본 이미지 img 태그로 출력. 이미지 업로드 시 업로드한 이미지 화면에 출력
                    
                    위 img 태그 클릭 시, 아래 input이 클릭되도록 처리해야 함. useRef 사용!
                    그리고, 이미지 파일 업로드 시, thumbImg를 변경하므로써 화면에 보여지는 이미지가
                    변경되어야 하기 때문에 onChange에서 파일을 읽어와서 세팅
                */}
                {thumbImg 
                    ?  <img src={thumbImg} onClick={function(){
                        thumbFileEl.current.click(); //아래 input type=file 클릭
                    }}/> 
                    : <img src="/images/default_img.png" onClick={function(e){
                        thumbFileEl.current.click(); //아래 input type=file 클릭
                    }}/>
                } 
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
                                {/* label 클릭 시, hmtlFor로 지정한 아래 input 클릭 */}
                                <label htmlFor="boardFile" className="btn-primary sm">파일첨부</label>
                                {/* 파일 업로드 시(onChange) 동작 함수 연결 */}
                                <input type="file" id="boardFile" style={{display:"none"}} onChange={chgBoardFile} multiple />
                            </td>
                        </tr>
                        <tr>
                            <th>첨부파일 목록</th>
                            <td>
                                <div className="board-file-wrap">
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