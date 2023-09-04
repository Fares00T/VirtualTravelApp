import React from "react";
import { Formik } from "formik";
import HeaderSection from "./HeaderImg/HeaderSection";
import axios from "axios";
import "./style.css";
import useTranslation from "../../hooks/useTranslation/useTranslation";
import { PageContentGlobal } from "../../GlobalStyles";
import useWindowSize from "../../hooks/useWindowSize";
import TabPanel from "./TabPanel/tabpanel";
import { useDispatch } from "react-redux";
import {
  ContentContainer,
  LeftContainer,
  LeftWrapper,
  AboutH1,
  AboutP,
  RightContainer,
} from "../About/AboutElements";
const Contact = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isDesktop = useWindowSize();

  return (
    <PageContentGlobal fixed={isDesktop}>
      <ContentContainer>
        <div className="header-section">
          <HeaderSection />
          <TabPanel/>
        </div>
      </ContentContainer>
    </PageContentGlobal>
  );
};

export default Contact;
