
import { Link } from "react-router-dom";

export default function LeftMenu(props){
    const menuList = props.menuList; //MemberMain, AdminMain에서 전달한 메뉴 정보 배열

    return(
        <div className="side-menu">
            <ul>
                {menuList.map(function(menu, idx){
                    return (
                        <li key={"side-menu"+idx}>
                            <Link to={menu.url}>
                                <span>{menu.text}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}