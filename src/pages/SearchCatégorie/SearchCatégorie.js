import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Navigate, useParams } from "react-router-dom";
import useTranslation from "../../hooks/useTranslation/useTranslation";
import {
  TopContainer,
  BottomContainer,
  TopContentContainer,
  CatégorieImg,
  CatégorieNom,
  ContentContainer,
  LeftContainer,
  LeftWrapper,
  PubContainer,
  PubImg,
  SearchMenu,
  SelectWilayaContainer,
  SelectWilayaVisible,
  WilayaSelectedH3,
  SelectWilayaUlHidden,
  Arrow,
  SelectWilayaLIHidden,
  SearchBar,
  SearchInput,
  SearchForm,
  SearchIconeContainer,
} from "./SearchCatégorieElements";
import CatégorieSection from "../../components/CatégorieSection/CatégorieSection";
import { ReactComponent as SearchIcone } from "./Svg/SearchIcone.svg";
import { PageContentGlobal } from "../../GlobalStyles";
import getLocationInformation from "../../assets/utilities/getLocationInformation";
import getWilayaInformation from "../../assets/utilities/getWilayaInformation";

import useWindowSize from "../../hooks/useWindowSize";
import SearchCatégorieMobile from "./SearchCatégorieMobile/SearchCatégorieMobile";
import Catégories from "../../assets/utilities/Catégories";
import { generalAPILink } from "../../assets/Variables/Links";
const SearchCatégorie = () => {
  const { t } = useTranslation();

  const { categorie } = useParams();
  let catActuelle = Catégories.find((cat) => {
    if (cat.catégorieName === categorie) {
      return cat;
    } else return null;
  });
  const [wilayas, setWilayas] = useState([]);
  const [showWilayas, setShowWilayas] = useState(false);

  const [locations, setLocations] = useState([]);
  const [mostVisitedLocations, setMostVisitedLocations] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    name: t("SearchPage.Wilaya"),
    id: null,
  });
  const formRef = useRef();
  const inputFocus = useRef();
  const [input, setInput] = useState("");
  const isDesktop = useWindowSize();
  useEffect(() => {
    axios
      .get(
        `${generalAPILink}/location?type_location=${catActuelle.idCatégorie}`
      )
      .then((response) => {
        let info = response.data.data;
        getLocationInformation(info, setLocations, true);
        let sortedInfo = info.sort((a, b) => {
          return a.visitedBy - b.visitedBy;
        });
        sortedInfo = sortedInfo.reverse();
        console.log(sortedInfo);
        getLocationInformation(sortedInfo, setMostVisitedLocations, true);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  // useEffect(() => {
  //   axios
  //     .get(`${generalAPILink}/banners/0`)
  //     .then((response) => {
  //       setBanners(response.data.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);
  useEffect(() => {
    axios
      .get(`${generalAPILink}/wilaya`)
      .then((response) => {
        getWilayaInformation(response.data.data, setWilayas, true);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  if (!Catégories.some((catégorie) => catégorie.catégorieName === categorie)) {
    return <Navigate to="/Search" replace />;
  }
  return (
    <PageContentGlobal fixed={!isDesktop}>
      {isDesktop ? (
        <ContentContainer>
          <TopContainer bg={catActuelle.bgImageCatégorie}>
            <TopContentContainer>
              <CatégorieImg src={catActuelle.mapImageCatégorie} />
              <CatégorieNom>
                {t(`SearchPage.Card.${catActuelle.catégorieName}`)}
              </CatégorieNom>
            </TopContentContainer>
          </TopContainer>
          <BottomContainer>
            <LeftContainer>
              <LeftWrapper>
                <SearchMenu>
                  <SelectWilayaContainer
                    onMouseLeave={() => {
                      setShowWilayas(false);
                    }}
                  >
                    <SelectWilayaVisible
                      showWilayas={showWilayas}
                      onMouseEnter={() => {
                        setShowWilayas(true);
                      }}
                    >
                      <WilayaSelectedH3>{selectedOption.name}</WilayaSelectedH3>
                      <Arrow />
                    </SelectWilayaVisible>
                    <SelectWilayaUlHidden
                      as={motion.div}
                      showWilayas={showWilayas}
                    >
                      <SelectWilayaLIHidden
                        onClick={() => {
                          setSelectedOption({
                            name: "Wilaya",
                            id: null,
                          });
                          setShowWilayas(false);
                        }}
                      >
                        --------
                      </SelectWilayaLIHidden>
                      {wilayas.map((wilaya) => {
                        return (
                          <SelectWilayaLIHidden
                            onClick={() => {
                              setSelectedOption({
                                name: wilaya.translatedName,
                                id: wilaya.id_wilaya,
                              });
                              setShowWilayas(false);
                            }}
                          >
                            {wilaya.translatedName}
                          </SelectWilayaLIHidden>
                        );
                      })}
                    </SelectWilayaUlHidden>
                  </SelectWilayaContainer>
                  <SearchBar>
                    <SearchForm
                      onClick={() => {
                        // When form clicked, set state of baropened to true and focus the input
                        inputFocus.current.focus();
                      }}
                      ref={formRef}
                    >
                      <SearchIconeContainer>
                        <SearchIcone />
                      </SearchIconeContainer>
                      <SearchInput
                        onChange={(e) => {
                          setInput(e.target.value);
                        }}
                        ref={inputFocus}
                        value={input}
                        placeholder={t("SearchPage.Research")}
                      />
                    </SearchForm>
                  </SearchBar>
                </SearchMenu>
                <CatégorieSection
                  locations={mostVisitedLocations}
                  id={selectedOption.id}
                  input={input}
                  sectionName={t("SearchCatégorie.The_Most_Visted")}
                />
                <CatégorieSection
                  locations={locations}
                  id={selectedOption.id}
                  input={input}
                  sectionName={t("SearchCatégorie.Recent_Added")}
                />
                <CatégorieSection
                  locations={locations.reverse()}
                  id={selectedOption.id}
                  input={input}
                  sectionName={t("SearchCatégorie.General")}
                  style={{ marginBottom: "20px" }}
                />
              </LeftWrapper>
            </LeftContainer>

            <PubContainer>
              {/* <PubImg src={banners.banner_recherche} /> */}
            </PubContainer>
          </BottomContainer>
        </ContentContainer>
      ) : (
        <SearchCatégorieMobile
          catégorieInformations={catActuelle}
          locations={locations}
          mostVisitedLocations={mostVisitedLocations}
        />
      )}
    </PageContentGlobal>
  );
};

export default SearchCatégorie;
