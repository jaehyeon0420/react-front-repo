import { useEffect, useState } from "react";
import createInstance from "../../axios/Interceptor";
import { Link, useNavigate } from "react-router-dom";
import PageNavi from "../common/PageNavi";

import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function AdminMember(){
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();

    const [memberList, setMemberList] = useState([]);
    const [reqPage, setReqPage] = useState(1);
    const [pageInfo, setPageInfo] = useState({});

    useEffect(function(){
        let options = {};
        options.url = serverUrl + "/admins/member?reqPage=" + reqPage;
        options.method = 'get';

        axiosInstance(options)
        .then(function(res){
            setMemberList(res.data.resData.memberList);
            setPageInfo(res.data.resData.pageInfo);
        })
        .catch(function(err){
            console.log(err);
        });

      //reqPage 변경 시, useEffect내 함수 재실행
    },[reqPage]);

    return (
        <>
            <div className="page-title">회원 관리</div>
            <table className="tbl">
                <thead>
                    <tr>
                        <th style={{width:"25%"}}>아이디</th>
                        <th style={{width:"25%"}}>이름</th>
                        <th style={{width:"25%"}}>전화번호</th>
                        <th style={{width:"25%"}}>등급</th>
                    </tr>
                </thead>
                <tbody>
                    {memberList.map(function(member, index){
                        return <Member key={"member" + index} member={member} index={index} memberList={memberList} setMemberList={setMemberList}/>
                    })}
                </tbody>
            </table>
            <div className="admin-page-wrap" style={{marginTop : "30px"}}>
                {/* 페이지 네비게이션 컴포넌트 재사용 */}
                <PageNavi pageInfo={pageInfo} reqPage={reqPage} setReqPage={setReqPage} />
            </div>
        </>
    );
}


function Member(props) {
    const member = props.member;
    const memberList = props.memberList;
    const setMemberList = props.setMemberList;
    const serverUrl = 'http://localhost:9999';
    const axiosInstance = createInstance();
    

    function handleChange(e){
        member.memberLevel = e.target.value; //변경된 option의 value! 주소를 가지는 객체이므로, 리스트에 다시 넣지 않아도 됨.
        
        let options = {};
        options.url = serverUrl + '/admins/member';
        options.method = 'patch'; //일부 변경
        options.data = { memberId : member.memberId, memberLevel : member.memberLevel };

        axiosInstance(options)
        .then(function(res){
            //SQL 정상 수행 시, 화면에 반영
            if(res.data.resData){
                //memberLevel만 변경된다고, 화면이 다시 랜더링 되지 않음. state로 선언한 배열의 주소가 변경되어야 함.
                setMemberList([...memberList]);
            }
        })
        .catch(function(err){
            console.log(err);
        });
        
    }

    return (
        <tr>
            <td>{member.memberId}</td>
            <td>{member.memberName}</td>
            <td>{member.memberPhone}</td>
            <td>{/* DB의 상태가 1이면 true로 전달하여 체크. 2면 false 전달하여 미체크 */}
                 <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">등급</InputLabel>
                        {/* Select : select, MenuItem : option 역할. 나머지 감싸는 태그들은 디자인 역할이므로 선택 사항 */}
                        <Select labelId="demo-simple-select-label" 
                                id="demo-simple-select"
                                value={member.memberLevel /* 초기 선택값. MenuItem value중 1가지를 지정해야 함. */}
                                label="Grade"
                                onChange={handleChange}>
                            <MenuItem value={1}>관리자</MenuItem>
                            <MenuItem value={2}>일반회원</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </td>
        </tr>
    );
}