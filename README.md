# 기술 과제 - 채팅 클라이언트 개발
## 목차

- [개발 환경](#개발-환경)
- [빌드 및 실행하기](#빌드-및-실행하기)
- [기능 요구사항](#기능-요구사항)
- [폴더 구조](#폴더-구조)
- [주요 기능](#주요-기능)
- [화면 구성](#화면-구성)

<br/><br/>

## 개발 환경

- 기본 환경
  - IDE: Visual Studio Code
  - OS: Mac
  - GIT

- Frontend
  - React (v18.3.1)
  - React Router DOM (v6.24.1)
  - Socket.IO Client (v4.7.5)
  - Axios (v1.7.2)

- Infra
  - AWS EC2, PM2, Docker

<br/><br/>

## 빌드 및 실행하기
### 터미널 환경
- Git, Node.js는 설치되어 있다고 가정합니다.

- .env 파일 설정
```plaintext
REACT_APP_BACKEND_URL=http://localhost:5001
```
```plaintext
$ git clone https://github.com/juhwano/backend-challenge-chat-client.git
$ cd backend-challenge-chat-client
$ npm install
$ npm start
```

<br/><br/>

## 기능 요구사항
### 개요
- 채팅 시스템의 클라이언트 부분을 구현합니다.
- 사용자는 웹 인터페이스를 통해 실시간으로 메시지를 주고받을 수 있습니다.
- 1:1 채팅 및 그룹 채팅을 모두 지원합니다.
### 필수사항
- 사용자 로그인 및 로그아웃 기능을 제공합니다.
- 실시간 채팅이 가능한 환경을 구성합니다.
- 1:1 채팅 및 그룹 채팅을 모두 지원합니다.
- 사용자 검색 기능을 제공합니다.
- 사용자의 접속 상태를 표시합니다.
- 채팅방 생성 및 참여 기능을 제공합니다.
### 제약사항
- 그룹 채팅의 인원은 최대 100명으로 제한합니다.
- 사용자가 전달할 수 있는 메시지는 텍스트만 가능합니다.
- 텍스트 메시지의 길이는 1,000자로 제한합니다.

<br/><br/>

## 폴더 구조
```bash
chat-client/
├── public/                      # 정적 파일
│   ├── index.html               # 메인 HTML 파일
│   └── manifest.json            # 웹 앱 매니페스트
├── src/
│   ├── components/              # 재사용 가능한 컴포넌트
│   │   ├── ChatRoom.js          # 채팅방 컴포넌트
│   │   ├── CreateGroupChatModal.js # 그룹 채팅방 생성 모달
│   │   └── ProtectedRoute.js    # 인증 라우트 컴포넌트
│   ├── pages/                   # 페이지 컴포넌트
│   │   └── Home.js              # 홈 페이지
│   ├── style/                   # CSS 스타일 파일
│   │   ├── ChatRoom.css         # 채팅방 스타일
│   │   ├── CreateGroupChatModal.css # 모달 스타일
│   │   └── Home.css             # 홈 페이지 스타일
│   ├── App.js                   # 메인 앱 컴포넌트
│   ├── App.css                  # 앱 스타일
│   ├── index.js                 # 진입점
│   └── index.css                # 전역 스타일
├── Dockerfile                   # Docker 이미지 빌드 설정
├── package.json                 # 프로젝트 메타데이터 및 의존성 정보
└── .env                         # 환경 변수 설정 파일
```

<br/><br/>

## 주요 기능
### 사용자 관리
- 닉네임 설정을 통한 간편 로그인/로그아웃
- 사용자 검색 기능
- 사용자 접속 상태 표시 (온라인/오프라인)
### 채팅방 관리
- 1:1 채팅방 생성 및 참여
- 그룹 채팅방 생성 및 참여
- 채팅방 목록 조회 및 페이지네이션
### 메시지 관리
- 실시간 메시지 전송 및 수신
- 메시지 길이 제한 (1,000자)
- 시스템 메시지 표시 (입장, 퇴장)

<br/><br/>

## 화면 구성
### 홈 화면
- 닉네임 설정 및 로그인/로그아웃
- 사용자 검색 기능
- 1:1 채팅 목록 (로그인 시)
- 그룹 채팅 목록
- 그룹 채팅방 생성 버튼 (로그인 시)
### 채팅방 화면
- 채팅방 이름 표시
- 메시지 목록 (사용자 메시지, 다른 사용자 메시지, 시스템 메시지)
- 메시지 입력 영역 (글자 수 제한 표시)
- 전송 버튼
- 나가기 버튼
