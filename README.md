# JBNU 웹서비스설계 과제2 :: Netflix Clone Project 🎥

본 프로젝트는 **React.js**와 **Typescript**를 기반으로 한 넷플릭스 클론 코딩 프로젝트입니다.
사이트의 이름은 "Castle Movie"로, 제가 사용하는 계정의 이름인 castle을 사용하였습니다.
영화 콘텐츠를 탐색하고 사용자 친화적인 인터페이스를 제공하기 위해 다양한 최신 기술 스택과 AI 서비스를 활용했습니다.

현재 제작된 정적페이지는 깃허브 액션에 ci-cd파이프라인을 이용하여 배포되고 있으며, tag를 이용해 버전관리 되고 있습니다.
현재 버전은 **v1.0.0** 입니다.

---

## 🚀 기술 스택

| **Frontend** | **CI/CD**         | **상태관리 및 재사용성**     | **AI Services**              |
|--------------|-------------------|------------------------------|------------------------------|
| ⚛️ React.js  | 🐙 GitHub Actions | 🛠️ Redux                     | 🤖 Perplexity                |
| 📘 Typescript| 🔄 GitHub Workflow| 🔗 Custom hook               | 🤖 Claude, ChatGPT           |

---

## !! 로컬과 배포사이트 차이

- 배포 사이트를 기준으로 코드가 작성되어있으므로, 로컬에서 실행시 base_url이 배포 사이트인
wsd-assignment-02로 리다이렉트 됩니다. 로컬에서 실행시 이 부분을 떼주면(localhost:3000/) 로컬에서도 접속이 가능합니다.

---

## 🛠️ 프로젝트 사용 방법

1. **클론**: 이 레포지토리를 로컬 환경에 복사합니다.  
   ```bash
   git clone https://github.com/your-repo/netflix-clone.git

2. **의존성 설치**
   ```bash
    npm install

3. **개발 서버 실행**
   ```bash
    npm run start

---
## 📂 프로젝트 파일 구조

  ```bash
  src/
  ├── components/          # 재사용 가능한 컴포넌트
  │   ├── auth/           # 인증 관련 컴포넌트
  │   ├── common/         # 공용 컴포넌트
  │   ├── home/          # 홈 페이지 컴포넌트
  │   ├── layouts/        # 레이아웃 컴포넌트
  │   ├── popular/        # 인기 콘텐츠 컴포넌트
  │   ├── search/         # 검색 페이지 컴포넌트
  │   └── wishlist/       # 위시리스트 컴포넌트
  │
  ├── hooks/              # 커스텀 훅 모음
  │   ├── useMovieData.ts
  │   └── useWishlist.ts
  │
  ├── pages/              # 주요 페이지
  │   ├── HomePage.tsx
  │   ├── PopularPage.tsx
  │   ├── SearchPage.tsx
  │   └── WishlistPage.tsx
  │
  ├── store/              # 상태 관리
  │   └── slices/         # Redux 슬라이스
  │
  ├── styles/             # 공통 스타일
  │   ├── Auth.css
  │   ├── Homepage.css
  │   └── variables.css
  │
  ├── types/              # TypeScript 타입 정의
  │   └── movie.ts
  │
  └── utils/              # 유틸리티 함수 및 설정
  ```
---

## 🌟 주요 기능

### 1. 로그인/회원가입 페이지 (`/signin`)
- **동적 디자인 구현**  
  오픈소스에서 제공되는 CSS 디자인을 **AI**를 활용하여 React 코드로 변환 및 적용.  
  사용자는 직관적이고 유려한 UI/UX 환경에서 로그인 및 회원가입을 할 수 있습니다.

### 2. 메인 페이지 (`/`)
- **TMDB API 통합**  
  TMDB API를 활용하여 최신 영화 데이터를 불러옵니다.  
- **배너**  
  배너에서 재생버튼을 누르면 유튜브에서 해당 영화의 공식 예고편을 볼 수 있으며 상세정보를 누르면 별점이나 개봉일자가 뜨게 됩니다.
- **영화 목록**
  영화 목록에서는 슬라이드 혹은 화살표 버튼을 눌러서 목록을 확인할 수 있습니다.
- **찜하기**
  커스텀 훅과 Redux를 이용해 상태관리가 되는 찜하기 기능을 통해 영화를 찜할 수 있습니다. 찜하게 되면 로컬스토리지에 저장됩니다.
  해당 기능은 대세 콘텐츠, 찾기 페이지와 모두 공통기능으로 지원됩니다. 찜할 때는 **하트**를 눌러주세요!

### 3. 대세 콘텐츠 페이지 (`/popular`)
- **TMDB API 통합**  
  TMDB API를 활용하여 최신 영화 데이터를 불러옵니다.  
- **무한 스크롤 & 페이지네이션 기능**  
  대량의 데이터를 효율적으로 탐색할 수 있도록 **무한 스크롤** 및 **테이블 뷰** 기능을 구현하였습니다.

### 4. 찾기 페이지 (`/search`)
- **검색**  
  검색창에 영화 제목을 입력 후 엔터를 누르면 관련 영화가 뜨게 되며, 최근 검색한 영화 5개를 볼 수 있습니다. 검색시 로컬 스토리지에 검색어가 저장되어 가능한 로직입니다.
- **필터**  
  API를 통해 불러와진 영화의 장르들을 선택해 영화를 골라 볼 수 있습니다. 필터는 중첩되어 인기순으로 어떤 장르의 영화들을 볼 수 도 있고, 1960년대의 영화를 볼 수도 있습니다. 물론 필터 초기화도 지원합니다.
- **페이지네이션 영화 목록**  
  영화 목록은 다른 페이지에서 처럼 map을 이용해 나열되며, 페이지를 넘기며 카드 형태의 영화들을 확인할 수 있습니다.

### 5. 내가 찜한 리스트 페이지 (`/wishlist`)
- **찜한 영화들**  
  로컬 스토리지에 저장해둔 찜해둔 영화들을 불러옵니다. 이미지는 베이스URL을 기준으로 이미지 링크와 합해 사진을 불러옵니다.
- **무한 스크롤 / 테이블뷰**  
  대량의 영화를 보기 쉽게 하기 위해 **무한 스크롤** 및 **테이블 뷰** 기능을 구현하였습니다.
- **정렬**
  로컬 저장소에 찜한 영화를 저장할 때 찜한 시간을 기록하여 찜한 순서로도 영화 목록을 볼 수 있으며, 평점순, 개봉일순으로도 영화 목록을 볼 수 있습니다.
  



