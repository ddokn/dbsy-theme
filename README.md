# 프로젝트 가이드

이 가이드는 프로젝트의 전체적인 흐름과 구조를 이해하는 데 도움을 주기 위해 작성되었습니다. 프로젝트의 주요 구성 요소, 디렉토리 구조, 주요 파일 설명, 코드 스니펫 및 사용 방법에 대해 설명합니다.

## 목차

- [프로젝트 가이드](#프로젝트-가이드)
  - [목차](#목차)
  - [프로젝트 개요](#프로젝트-개요)
  - [디렉토리 구조](#디렉토리-구조)
  - [주요 파일 설명](#주요-파일-설명)
    - [`layout/index.html`](#layoutindexhtml)
      - [설명](#설명)
    - [`assets/template.js`](#assetstemplatejs)
      - [설명](#설명-1)
    - [`assets/global.js`](#assetsglobaljs)
      - [설명](#설명-2)
  - [코드 스니펫](#코드-스니펫)

---

## 프로젝트 개요

이 프로젝트는 HTML, CSS, JavaScript를 사용하여 반응형 디자인과 동적인 콘텐츠 로딩을 구현하였습니다. 사용자에게 최적의 웹 경험을 제공하기 위해 다양한 섹션과 재사용 가능한 컴포넌트를 포함하고 있습니다.

## 디렉토리 구조

프로젝트의 디렉토리 구조는 다음과 같습니다:

- **assets/**: 프로젝트에서 사용하는 정적인 자산 파일들(CSS, JavaScript, 이미지 등)이 포함됩니다.
- **layout/**: HTML 레이아웃 파일들이 위치합니다.
- **sections/**: 재사용 가능한 HTML 섹션 파일들이 위치합니다.
- **snippets/**: 추가적인 HTML 스니펫 파일들이 위치합니다.
- **README.md**: 프로젝트에 대한 설명서입니다.

## 주요 파일 설명

### `layout/index.html`

프로젝트의 메인 HTML 파일로, 기본적인 구조와 필수 리소스들이 포함되어 있습니다.

#### 설명

- **`data-section` 속성**: 각 HTML 요소에 `data-section` 속성이 부여되어 있어, JavaScript와 CSS에서 특정 섹션을 쉽게 참조하고 스타일링할 수 있습니다. 이는 코드의 가독성과 유지보수성을 높이는 데 도움을 줍니다.
  
- **헤더 및 푸터**: `<header>`와 `<footer>` 태그는 각각 사이트의 헤더와 푸터 섹션을 담당하며, `data-section` 속성을 통해 `sections/` 디렉토리에 있는 관련 HTML 파일의 내용을 불러옵니다.
  
- **메인 콘텐츠**: `<main>` 태그 내에는 다양한 섹션(`main-slider`, `image-banner`, `featured-card`, `featured-board`, `text-banner` 등)이 포함되어 있어 페이지의 주요 콘텐츠를 구성합니다. 각 섹션은 `data-section` 속성을 사용하여 JavaScript를 통해 동적으로 콘텐츠가 로드됩니다.
  
- **스타일 및 스크립트**: 외부 CSS 및 JavaScript 파일들이 링크되어 있으며, `template.js`와 `global.js`는 각각 템플릿 관련 로직과 글로벌 스크립트를 담당합니다.

### `assets/template.js`

프로젝트의 템플릿 관련 JavaScript 파일입니다.

#### 설명

- **DOMContentLoaded 이벤트**: 문서의 모든 HTML이 로드되고 분석되었을 때 실행되는 이벤트 리스너를 설정합니다.
  
- **템플릿 로직**: 템플릿과 관련된 추가적인 스크립트를 이곳에 구현할 수 있습니다. 예를 들어, 특정 섹션에 동적 콘텐츠를 로드하거나 사용자 상호작용을 처리할 수 있습니다.

### `assets/global.js`

프로젝트의 글로벌 JavaScript 설정 파일입니다.

#### 설명

- **글로벌 스크립트 로직**: 모든 페이지에서 공통으로 사용되는 JavaScript 기능을 이 파일에 구현합니다. 예를 들어, 네비게이션 메뉴의 동작, 공통된 이벤트 처리, 애니메이션 효과 등을 포함할 수 있습니다.
  
- **커스텀 엘리먼트**:
  
  - **`SwiperCarousel`**: 기본적인 Swiper 캐러셀 기능을 확장한 커스텀 엘리먼트입니다. 슬라이드 설정과 초기화를 담당합니다.

  - **`mainSlider`**: `SwiperCarousel`을 확장하여 메인 슬라이더에 특화된 기능을 추가합니다. 슬라이드 복제, 커스텀 페이징, 네비게이션 버튼 등을 포함합니다.

  - **`HeaderDropdownMenu`**: 헤더 내 드롭다운 메뉴의 동작을 제어하는 커스텀 엘리먼트입니다. 메뉴 아이템 호버 시 서브메뉴를 표시합니다.

  - **`MobileMenu`**: 모바일 환경에서의 메뉴 동작을 제어하는 커스텀 엘리먼트입니다. 메뉴 버튼 클릭 시 메뉴를 토글하고, 서브메뉴의 표시를 관리합니다.

  - **`MainTab`**: 탭 인터페이스를 구현하는 커스텀 엘리먼트입니다. 탭 버튼 클릭 시 해당 탭 내용이 표시되도록 합니다.

- **`data-section` 활용**: `data-section` 속성을 활용하여 특정 섹션에 대한 동작이나 스타일을 제어할 수 있습니다. 커스텀 엘리먼트를 통해 각 섹션의 동적 로딩과 인터랙션을 관리합니다.

## 코드 스니펫

프로젝트에서 재사용되는 주요 코드 스니펫을 `sections/` 및 `snippets/` 디렉토리에 저장하여 효율적인 개발을 지원합니다. 각 스니펫은 특정 섹션의 HTML 구조를 정의하며, `data-section` 속성을 통해 `layout/*.html 에서 참조됩니다.