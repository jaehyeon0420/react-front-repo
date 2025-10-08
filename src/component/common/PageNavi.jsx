

export default function PageNavi(props){

    //페이지 네비게이션 정보
    const pageInfo = props.pageInfo;
    //선택된 페이지 번호 CSS 처리를 위해
    const reqPage = props.reqPage;
    //페이지 번호 클릭 시, reqPage 변경 처리.
    const setReqPage = props.setReqPage;
    //페이징 JSX가 저장될 배열 선언.
    const pageArr = new Array(); //   << <  1 2 3 4 5 > >>

    // << 제일 앞 페이지로 이동
    pageArr.push(
        <li key="first-page">
            <span onClick={function(){setReqPage(1)}} 
                  className="material-icons page-item">
                    first_page
            </span>
        </li>
    );
    // < 이전 페이지로 이동
    pageArr.push(
        <li key="prev-page">
            <span onClick={function(){if(reqPage > 1) {setReqPage(reqPage-1)}}} 
                  className="material-icons page-item">
                    navigate_before
            </span>
        </li>
    );
    // 1 2 3 4 5 페이징 숫자 제작
    let pageNo = pageInfo.pageNo; //시작 번호
    for(let i=0; i<pageInfo.pageNaviSize; i++){
        pageArr.push(
            <li key={"page" + i}>
                <span onClick={function(e){setReqPage(Number(e.target.innerText))}} 
                      className={"page-item" + (pageNo == reqPage ? " active-page" : "")}>
                        {pageNo}
                </span>
            </li>
        );
        pageNo++;

        //무조건 pageNaviSize만큼 제작하지 않고, 게시글 다 출력되었으면 STOP
        if(pageNo > pageInfo.totalPage){
            break;
        }
    }
    // > 다음 페이지로 이동
    pageArr.push(
        <li key="next-page">
            <span onClick={function(){if(reqPage < pageInfo.totalPage) {setReqPage(reqPage+1)}}} 
                  className="material-icons page-item">
                    navigate_next
            </span>
        </li>
    );
    // >> 제일 마지막 페이지로 이동
    pageArr.push(
        <li key="last-page">
            <span onClick={function(){setReqPage(pageInfo.totalPage)}} 
                  className="material-icons page-item">
                    last_page
            </span>
        </li>
    );

    return (
        <ul className="pagination">
            {/* 자바스크립트에서 배열 출력 시, 내부 요소 붙여서 출력 */}
            {pageArr}
        </ul>
    );
}