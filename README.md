# Chat System

사내 협업을 가정한 채팅 시스템 프로젝트입니다.  
메신저 기능뿐 아니라 공지, 부서별 사용자 목록, 출퇴근, 휴가 관리 패널을 한 화면에서 다루는 것을 목표로 만들고 있습니다.

## Overview

이 프로젝트는 프론트 화면을 만드는 것에서 끝나지 않고, Prisma와 Next.js Route Handler를 이용해 실제 데이터 흐름까지 연결하는 연습을 중심으로 진행했습니다.

주요 흐름:

- Prisma schema로 데이터 모델 정의
- Prisma Studio로 데이터 입력 및 확인
- `app/api/*/route.ts`에서 API 작성
- React 컴포넌트에서 `fetch` + `useEffect` + `useState`로 데이터 연동

## Main Features

- 채팅방 목록 조회
- 채팅 상세 조회 및 메시지 전송
- 공지사항 조회
- 부서별 사용자 목록 조회
- 출근/퇴근 기록 조회 및 저장
- 휴가 현황 및 휴가 신청 UI

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL
- Lucide React

## API Routes

현재 프로젝트에는 아래와 같은 API 라우트가 있습니다.

- `GET /api/home`
  홈 화면에 필요한 사용자, 채팅방, 공지 데이터 조회
- `GET /api/users`
  사용자 목록 조회
- `GET /api/departments`
  사용자 데이터를 부서 기준으로 그룹핑해서 조회
- `GET /api/attendance`
  출근/퇴근 기록 조회
- `POST /api/attendance`
  출근 기록 생성
- `PATCH /api/attendance`
  퇴근 기록 업데이트
- `POST /api/messages`
  메시지 저장

## What I Focused On

이 프로젝트에서 특히 집중한 부분은 다음과 같습니다.

- 더미 데이터 중심 화면을 실제 DB 기반 화면으로 바꾸기
- 컴포넌트별로 필요한 데이터를 어떤 API로 나눌지 설계하기
- `home`, `departments`, `attendance`, `messages`처럼 역할에 맞게 API 분리하기
- 프론트 상태와 서버 데이터를 연결하는 흐름 이해하기
- 출근 생성과 퇴근 업데이트처럼 CRUD 흐름을 화면과 API에 맞게 나누기

## Project Structure

```text
app/
  api/
    attendance/
    departments/
    home/
    messages/
    users/
  chat/
components/
  chat/
  home/
lib/
  prisma.ts
prisma/
  schema.prisma
types/
```

## Running Locally

1. 의존성 설치

```bash
npm install
```

2. Prisma schema를 DB에 반영

```bash
npx prisma db push
```

3. Prisma Studio 실행

```bash
npx prisma studio
```

4. 개발 서버 실행

```bash
npm run dev
```

## Notes

- 현재 프로젝트는 기능 구현과 데이터 연동 학습에 초점을 두고 있습니다.
- 로그인/인증은 아직 없어서 일부 화면은 임시 사용자 ID를 기준으로 동작합니다.
- 점진적으로 더미 데이터를 제거하고 DB 기반 흐름으로 전환하는 방식으로 개발 중입니다.
