import logo from "../assets/img/numaLogo_transparent.png";

import {
  faBars,
  faClose,
  faFileText,
  faMoneyBill,
  faPerson,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import { MobileContext } from "../providers/MobileProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoginContext } from "../providers/LoginProvider";

export default function Sidebar() {
  const { isMobile, setIsMobile } = useContext(MobileContext);
  const { loginData, setLoginData } = useContext(LoginContext);
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  const location = useLocation();

  const sidebarContent = [
    {
      icon: faFileText,
      label: "Request Management",
      route: "/request",
      onClick: () => {},
      requireRoles: ["user", "approver", "finance"],
    },
    {
      icon: faPerson,
      label: "Users",
      route: "/admin",
      onClick: () => {},
      requireRoles: ["admin"],
    },
    {
      icon: faSignOut,
      label: "Log Out",
      route: "/auth",
      onClick: () => {
        setLoginData(undefined);
        window.localStorage.removeItem("auth_token");
        navigate("/auth");
      },
      customStyle: "text-red-700",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      overlayRef.current &&
      overlayRef.current.contains(event.target)
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div>
      {isMobile && !isSidebarOpen && (
        <div className="fixed top-3 left-6 z-50 p-4">
          <FontAwesomeIcon
            icon={faBars}
            className="text-2xl cursor-pointer hover:text-gray-500 transition duration-100"
            onClick={toggleSidebar}
            color="black"
          />
        </div>
      )}

      {isMobile && isSidebarOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        ></div>
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 w-[250px] h-full bg-primary shadow-md z-50 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center pl-7 py-10">
          <img
            src={logo}
            alt="Logo"
            className="w-44 h-auto rounded-xl cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {loginData
          ? sidebarContent.map((item, index) => {
              if (item.requireRoles && item.requireRoles.length > 0) {
                if (!item.requireRoles.includes(loginData.role)) return null;
              }

              const pathCheck =
                location.pathname === "/" ? "/dash" : location.pathname;
              const itemCheck = item.route === "/" ? "/dash" : item.route;

              return (
                <ul className={`mt-2`} key={index}>
                  <li className={`py-2`}>
                    <div
                      onClick={() => {
                        if (typeof item.onClick === "function") item.onClick();
                        navigate(item.route);
                      }}
                      className={
                        "flex items-center text-white font-sans hover:bg-neutral-700 transition-all duration-200 h-10 w-full cursor-pointer " +
                        (pathCheck.startsWith(itemCheck)
                          ? "border-l-4 border-white"
                          : "") +
                        (item.customStyle ? item.customStyle : "")
                      }
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="mr-5 ml-10"
                        style={{ width: "22px", height: "22px" }}
                      />
                      {item.label}
                    </div>
                  </li>
                </ul>
              );
            })
          : null}
      </div>
    </div>
  );
}
