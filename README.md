# SoDam-Agent-Codex

> AI나 명령어를 처음 쓰는 사람도 따라 할 수 있는 SoDam-Agent Codex 포팅판 설치·사용 안내서

SoDam-Agent-Codex는 원본 **SoDam-Agent**의 전문 역할을 Codex에서 선택해 사용할 수 있도록 옮긴 저장소형 플러그인 마켓플레이스입니다. 웹앱 개발, 문서 작성, 리서치, 데이터, 마케팅, 보안 감사, DevOps, 고객지원, 제품관리, 번역을 위한 10개 팀과 사용자 소유 스킬을 안전하게 관리하는 1개 플러그인을 제공합니다.

이 저장소 자체는 별도 웹사이트, 모바일 앱, 서버 또는 데이터베이스가 아닙니다. Codex CLI에 마켓플레이스를 등록하고 필요한 플러그인을 추가하면, Codex가 포함된 `SKILL.md` 지침을 읽어 작업에 적용합니다.

## 언어와 문서 형식

- 한국어 Markdown: `README.md`
- English Markdown: `README.en.md`
- 한국어 HTML: `README.html`
- English HTML: `README.en.html`

네 문서는 프로젝트 최상위 폴더에 있습니다. 각 HTML 문서는 대응하는 Markdown 원문에서 생성되어 같은 내용을 담습니다.

## 목차

1. [처음 보는 분을 위한 한 문장 설명](#1-처음-보는-분을-위한-한-문장-설명)
2. [현재 상태와 확인 범위](#2-현재-상태와-확인-범위)
3. [사전 준비물과 필요 프로그램](#3-사전-준비물과-필요-프로그램)
4. [다운로드 방법](#4-다운로드-방법)
5. [설치 방법](#5-설치-방법)
6. [5분 빠른 시작](#6-5분-빠른-시작)
7. [실행·사용 방법](#7-실행사용-방법)
8. [작동 원리와 워크플로우](#8-작동-원리와-워크플로우)
9. [플러그인과 스킬 전체 목록](#9-플러그인과-스킬-전체-목록)
10. [명령어 모음](#10-명령어-모음)
11. [폴더 구조와 아키텍처](#11-폴더-구조와-아키텍처)
12. [보안과 데이터 흐름](#12-보안과-데이터-흐름)
13. [파일·문서 위치](#13-파일문서-위치)
14. [개발·검증 방법](#14-개발검증-방법)
15. [업데이트 내용 요약](#15-업데이트-내용-요약)
16. [문제·오류 대처](#16-문제오류-대처)
17. [FAQ](#17-faq)
18. [법률·저작권·라이선스·상업적 이용](#18-법률저작권라이선스상업적-이용)
19. [현재 한계와 미확인 항목](#19-현재-한계와-미확인-항목)
20. [업데이트·기여 체크리스트](#20-업데이트기여-체크리스트)
21. [원본과 출처](#21-원본과-출처)

## 1. 처음 보는 분을 위한 한 문장 설명

이 프로젝트는 **Codex 안에 전문가별 업무 설명서를 추가하는 도구 상자**입니다. 예를 들어 `docs-team`을 설치한 뒤 “문서팀으로 초보자 안내서를 작성해줘”라고 요청하면, 문서 작성·편집·사실 확인 역할의 지침을 작업에 적용합니다.

알아둘 점은 다음과 같습니다.

- 자동으로 모든 팀이 항상 실행되는 것은 아닙니다. 설치한 플러그인과 요청 내용에 따라 필요한 스킬을 사용합니다.
- 팀 스킬은 작은 요청이면 필요한 역할만 사용합니다.
- 사용자가 팀 작업이나 병렬 처리를 명시적으로 요청하지 않는 한 서브에이전트를 자동으로 만들지 않습니다.
- 삭제, 배포, 외부 전송처럼 영향이 큰 작업은 사용자 권한과 확인이 필요합니다.
- AI 결과는 검토가 필요합니다. 특히 법률, 보안, 개인정보, 배포 결과는 사람의 최종 확인이 필요합니다.

## 2. 현재 상태와 확인 범위

### 확인된 내용

- 마켓플레이스에 등록된 플러그인: **11개**
- 전체 스킬: **46개**
  - 팀 조율 스킬 10개
  - 전문 역할 스킬 31개
  - 사용자 스킬 관리 스킬 5개
- 플러그인 매니페스트: 현재 형식 `plugin.json`과 호환 형식 `.codex-plugin/plugin.json`을 함께 제공
- 웹앱팀과 리서치팀만 Context7 MCP `4.1.1`을 사용하도록 선언
- 프로젝트 런타임 의존성: **0개**
- 로컬 정적 검증, 통합 검증, 악성 입력 방어 검증, 런타임 조건 검증, CI 설정 검증 통과
- Apache License 2.0 원문과 NOTICE 포함

### 사용 전에 알아야 할 상태

- 공식 배포 주소는 [sodam-ai/SoDam-Agent-Codex](https://github.com/sodam-ai/SoDam-Agent-Codex)입니다. 설치 전 GitHub에서 공개 상태와 최신 README를 확인하십시오.
- 아래 로컬 경로는 설명용 예시입니다. 실제 압축 해제 또는 복제한 폴더 경로로 바꿔 입력하십시오.
- 사용자 Codex 설정을 바꾸지 않기 위해 실제 마켓플레이스 등록과 플러그인 설치는 검증 과정에서 실행하지 않았습니다.
- Context7 프로세스 시작은 확인했지만 MCP 초기화 협상과 실제 문서 요청까지는 확인하지 않았습니다.

## 3. 사전 준비물과 필요 프로그램

### 반드시 필요한 것

1. **컴퓨터**
   - Windows, macOS 또는 Linux에서 Codex CLI를 실행할 수 있어야 합니다.
   - 이 포팅판은 Windows 로컬 환경에서 검증했습니다. 다른 운영체제에서는 경로 표기와 셸 명령이 달라질 수 있습니다.
   - 스마트폰이나 태블릿만으로는 로컬 Codex CLI 플러그인을 설치·실행하기 어렵습니다. 모바일 기기는 문서나 GitHub 내용을 보는 용도로 사용할 수 있습니다.

2. **Codex CLI의 플러그인 기능**
   - 설치 안내: [OpenAI Codex 공식 저장소](https://github.com/openai/codex)
   - 설치 후 확인:

```powershell
codex --version
codex plugin --help
```

3. **Node.js 20.18.1 이상**
   - 다운로드: [Node.js 공식 다운로드](https://nodejs.org/en/download)
   - `npm`과 `npx`는 일반적으로 Node.js와 함께 설치됩니다.
   - 웹앱팀과 리서치팀의 Context7 MCP에 필요하며, 이 저장소의 검증 명령에도 사용합니다.

```powershell
node --version
npm --version
npx --version
```

`node --version`의 숫자가 `v20.18.1` 이상이어야 합니다. 예를 들어 `v22.x.x`도 조건을 충족합니다.

### 있으면 편리한 것

- **Git**: 저장소 복제와 업데이트에 사용합니다. [Git 공식 다운로드](https://git-scm.com/downloads)
- **웹 브라우저**: GitHub에서 ZIP 파일을 받을 때 사용합니다.
- **코드 편집기**: 문서를 읽거나 사용자 스킬을 편집할 때 사용합니다. 필수는 아닙니다.

### 필요하지 않은 것

- 별도 데이터베이스
- Docker
- 프로젝트 전용 환경 변수나 API 키
- 이 저장소의 `npm install` 실행: 현재 `package.json`에 런타임 의존성이 없습니다.
- `npm publish`: 이 저장소는 `private: true`인 Codex 플러그인 마켓플레이스이며 npm 패키지 게시물이 아닙니다.

단, Context7 MCP를 처음 실행할 때 `npx`가 npm 레지스트리에서 고정 버전 패키지를 내려받을 수 있으므로 인터넷 연결이 필요할 수 있습니다.

## 4. 다운로드 방법

### 방법 A: 이미 받은 로컬 폴더 사용

이미 프로젝트 폴더가 있다면 추가 다운로드 없이 사용할 수 있습니다. 아래는 예시이며, `C:\path\to` 부분을 실제 위치로 바꾸십시오.

```text
C:\path\to\SoDam-Agent-Codex
```

### 방법 B: Git으로 받기

GitHub 저장소에 접근할 수 있는지 확인한 뒤 실행합니다.

```powershell
git clone https://github.com/sodam-ai/SoDam-Agent-Codex.git
cd SoDam-Agent-Codex
```

### 방법 C: ZIP으로 받기

1. GitHub의 `sodam-ai/SoDam-Agent-Codex` 페이지를 엽니다.
2. **Code** 버튼을 누릅니다.
3. **Download ZIP**을 누릅니다.
4. 다운로드한 ZIP 파일의 압축을 풉니다.
5. 압축을 푼 폴더 안에 `.agents`, `plugins`, `package.json`, `LICENSE`가 있는지 확인합니다.

> 원본 `sodam-ai/SoDam-Agent`를 대신 설치하지 마십시오. 원본과 Codex 포팅판은 구조와 실행 방식이 다릅니다.

## 5. 설치 방법

설치는 두 단계입니다. 먼저 **마켓플레이스**를 등록하고, 그다음 원하는 **플러그인**을 추가합니다.

### 5.1 로컬 폴더를 마켓플레이스로 등록

Windows PowerShell 또는 터미널에서 실행합니다. 아래 예시 경로를 실제 프로젝트 폴더 경로로 바꾸십시오.

```powershell
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"
```

등록 확인:

```powershell
codex plugin marketplace list
```

목록에서 `sodam-agent-codex`를 찾습니다.

### 5.2 GitHub 마켓플레이스 등록

```powershell
codex plugin marketplace add sodam-ai/SoDam-Agent-Codex --ref main
```

이 명령이 실패하면 저장소가 아직 없거나 비공개이거나, 네트워크 또는 접근 권한 문제가 있을 수 있습니다.

### 5.3 원하는 플러그인 추가

처음에는 필요한 플러그인 1~2개만 설치하는 것이 이해하기 쉽습니다.

```powershell
codex plugin add docs-team@sodam-agent-codex
codex plugin add sodam-agent@sodam-agent-codex
```

설치 확인:

```powershell
codex plugin list
codex plugin list --marketplace sodam-agent-codex
```

### 5.4 11개 플러그인을 모두 추가하려는 경우

필요한 항목만 골라 한 줄씩 실행하십시오.

```powershell
codex plugin add web-app-team@sodam-agent-codex
codex plugin add docs-team@sodam-agent-codex
codex plugin add research-team@sodam-agent-codex
codex plugin add data-team@sodam-agent-codex
codex plugin add marketing-team@sodam-agent-codex
codex plugin add security-audit-team@sodam-agent-codex
codex plugin add devops-team@sodam-agent-codex
codex plugin add customer-support-team@sodam-agent-codex
codex plugin add pm-team@sodam-agent-codex
codex plugin add localization-team@sodam-agent-codex
codex plugin add sodam-agent@sodam-agent-codex
```

설치 후 현재 Codex 화면에서 바로 보이지 않으면 새 작업을 열거나 Codex를 다시 시작한 뒤 목록을 확인합니다. 앱 버전에 따라 표시 위치나 이름 형식이 다를 수 있습니다.

## 6. 5분 빠른 시작

### 1단계: 프로그램 확인

```powershell
codex --version
node --version
```

### 2단계: 현재 로컬 마켓플레이스 등록

```powershell
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"
```

### 3단계: 문서팀 설치

```powershell
codex plugin add docs-team@sodam-agent-codex
```

### 4단계: Codex에서 자연어로 요청

새 Codex 작업에서 다음처럼 입력합니다.

```text
문서팀으로 이 프로젝트를 처음 쓰는 사람을 위한 설치 안내서를 작성해줘.
확인된 사실과 미확인 항목을 구분하고, 마지막에 자체 검토해줘.
```

### 5단계: 결과 확인

- 생성 또는 변경된 파일 경로를 확인합니다.
- 실제 실행한 검증 명령과 통과·실패 결과를 확인합니다.
- 모르는 내용이 사실처럼 적히지 않았는지 확인합니다.
- 삭제, 배포, 외부 전송이 포함되면 실행 전에 대상과 영향을 다시 확인합니다.

## 7. 실행·사용 방법

### 별도 서버를 실행해야 하나요?

아니요. 일반 팀 플러그인은 별도 서버나 화면을 실행하지 않습니다. Codex에서 요청하면 설치된 스킬 지침이 작업에 사용됩니다.

웹앱팀 또는 리서치팀이 Context7을 사용할 때는 Codex가 다음 고정 패키지를 MCP 프로세스로 실행할 수 있습니다.

```text
npx -y @upstash/context7-mcp@4.1.1
```

### 팀별 사용 예시

- 웹앱팀: `웹앱팀으로 요구사항을 나누고 프론트엔드와 백엔드를 구현한 뒤 검토해줘.`
- 문서팀: `문서팀으로 초보자용 사용 설명서를 작성하고 사실관계를 검토해줘.`
- 리서치팀: `리서치팀으로 공식 자료를 조사하고 사실, 해석, 미확인을 구분해줘.`
- 데이터팀: `데이터팀으로 CSV를 정리하고 분석한 뒤 이해하기 쉬운 차트를 제안해줘.`
- 마케팅팀: `마케팅팀으로 제품 소개문, 검색 키워드, 소셜 게시물을 만들어줘.`
- 보안감사팀: `보안감사팀으로 이 코드의 취약점과 규정 위험을 점검해줘. 수정은 제안만 해줘.`
- DevOps팀: `DevOps팀으로 배포 절차와 CI 설정을 점검하고 실패 원인을 분석해줘.`
- 고객지원팀: `고객지원팀으로 문의 답변, FAQ, 반복 불만 분석을 작성해줘.`
- PM팀: `PM팀으로 요구사항, 우선순위, 로드맵, 회의 결정사항을 정리해줘.`
- 번역팀: `번역팀으로 이 문서를 영어로 번역하고 용어와 문화적 표현을 검토해줘.`
- 스킬관리: `새 에이전트 스킬을 만들고 싶어. 한 번에 질문 하나씩 해줘.`

Codex UI에서 스킬을 직접 선택하거나 이름으로 요청할 수도 있습니다. 정확한 표시 형식은 Codex 앱·CLI 버전에 따라 달라질 수 있으므로 `codex plugin list`와 화면의 설치 목록을 기준으로 확인하십시오.

## 8. 작동 원리와 워크플로우

```text
사용자 요청
  ↓
Codex가 설치된 플러그인과 관련 스킬을 찾음
  ↓
팀 조율 스킬이 범위·결과물·역할 순서를 정함
  ↓
필요한 전문 역할 스킬이 작성·구현·분석을 수행
  ↓
마지막 역할이 충돌과 누락을 증거로 검토
  ↓
결과물, 실행한 검증, 실패·미확인 사항을 사용자에게 보고
```

공통 운영 원칙:

1. 범위와 결과물을 먼저 정합니다.
2. 작은 요청에는 필요한 역할만 사용합니다.
3. 사실, 가정, 미확인 내용을 분리합니다.
4. 여러 역할의 의견이 충돌하면 마지막 검토 역할이 파일·로그·공식 자료 같은 증거로 판단합니다.
5. 외부 전송, 배포, 삭제, 덮어쓰기는 사용자 권한을 확인합니다.
6. 파일 존재만으로 완료라고 하지 않고 결과물과 검증 결과를 함께 확인합니다.

## 9. 플러그인과 스킬 전체 목록

### 전문팀 10개

| 플러그인 | 용도 | 포함 스킬 |
|---|---|---|
| `web-app-team` | 웹앱 기획·구현·검토 | `web-app-team`, `planner`, `frontend-dev`, `backend-dev`, `reviewer` |
| `docs-team` | 문서 작성·편집·사실 확인 | `docs-team`, `writer`, `editor`, `fact-checker` |
| `research-team` | 조사·분석·비판적 종합 | `research-team`, `researcher`, `analyst`, `critic` |
| `data-team` | 데이터 처리·분석·시각화 | `data-team`, `data-engineer`, `data-analyst`, `data-viz` |
| `marketing-team` | 카피·검색·소셜 운영 | `marketing-team`, `copywriter`, `seo-analyst`, `social-manager` |
| `security-audit-team` | 보안·취약점·컴플라이언스 검토 | `security-audit-team`, `security-auditor`, `vulnerability-analyst`, `compliance-reviewer` |
| `devops-team` | 배포·CI/CD·인프라 장애 대응 | `devops-team`, `deploy-engineer`, `cicd-manager`, `infra-troubleshooter` |
| `customer-support-team` | 고객 답변·FAQ·피드백 분석 | `customer-support-team`, `support-agent`, `faq-writer`, `feedback-analyst` |
| `pm-team` | 요구사항·로드맵·회의 기록 | `pm-team`, `requirements-analyst`, `roadmap-planner`, `meeting-scribe` |
| `localization-team` | 번역·현지화·용어 검토 | `localization-team`, `translator`, `localization-specialist`, `terminology-reviewer` |

### 사용자 스킬 관리 플러그인 1개

| 플러그인 | 스킬 | 하는 일과 안전장치 |
|---|---|---|
| `sodam-agent` | `new-agent` | 이름·역할·범위·규칙을 확인하고 경로와 전체 내용을 미리 보여준 뒤 승인받아 새 사용자 스킬 생성 |
| `sodam-agent` | `pick-agent` | 설치된 역할을 사용자 스킬로 복사·맞춤화하며 충돌 시 백업과 승인을 요구 |
| `sodam-agent` | `training-agent` | 모델을 학습시키는 기능이 아니라 사용자 `SKILL.md` 지침을 백업·차이 검토 후 수정 |
| `sodam-agent` | `save-agent` | 사용자 스킬을 개인 폴더나 지정 보관소에 저장하고 비밀 검사·해시 또는 내용 비교 수행 |
| `sodam-agent` | `remove-agent` | 사용자 소유 스킬만 대상으로 백업을 만든 뒤 최종 승인을 받아 제거; 설치 플러그인 내부 파일은 직접 삭제하지 않음 |

## 10. 명령어 모음

### 환경 확인

```powershell
codex --version
codex plugin --help
node --version
npm --version
npx --version
```

### 마켓플레이스 관리

```powershell
# 로컬 폴더 등록
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"

# GitHub 저장소 등록
codex plugin marketplace add sodam-ai/SoDam-Agent-Codex --ref main

# 목록 확인
codex plugin marketplace list

# 등록된 마켓플레이스 업데이트
codex plugin marketplace upgrade sodam-agent-codex
```

### 플러그인 관리

```powershell
# 추가
codex plugin add docs-team@sodam-agent-codex

# 설치 목록
codex plugin list
codex plugin list --marketplace sodam-agent-codex

# 설치 가능한 항목을 JSON으로 확인
codex plugin list --available --json

# 제거 예시
codex plugin remove docs-team@sodam-agent-codex
```

플러그인을 제거하기 전에 해당 플러그인의 사용자 맞춤 파일이나 중요한 결과물이 별도 위치에 저장되어 있는지 확인하십시오. 사용자 스킬은 설치 플러그인 내부가 아닌 사용자 소유 스킬 폴더에 보관하는 것이 안전합니다.

### 프로젝트 검증

```powershell
npm run validate
npm test
npm pack --dry-run --json
```

## 11. 폴더 구조와 아키텍처

```text
SoDam-Agent-Codex/
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json       # 11개 플러그인의 단일 등록 목록
├─ .github/
│  └─ workflows/
│     └─ ci.yml                 # GitHub Actions 검증
├─ plugins/
│  ├─ web-app-team/
│  ├─ docs-team/
│  ├─ research-team/
│  ├─ data-team/
│  ├─ marketing-team/
│  ├─ security-audit-team/
│  ├─ devops-team/
│  ├─ customer-support-team/
│  ├─ pm-team/
│  ├─ localization-team/
│  └─ sodam-agent/
│     ├─ plugin.json            # 현재 매니페스트
│     ├─ .codex-plugin/
│     │  └─ plugin.json         # 호환 매니페스트
│     ├─ .mcp.json              # 해당 플러그인에 필요할 때만 존재
│     └─ skills/<skill>/SKILL.md
├─ scripts/                     # 구조·플러그인·스킬 검증기
├─ test/                        # E2E·악성 입력·런타임·CI 검증
├─ README.md / README.html      # 한국어 문서
├─ README.en.md / README.en.html # 영문 문서
├─ PORTING_REPORT.md            # 포팅 범위와 근거
├─ LICENSE                      # Apache License 2.0
├─ NOTICE                       # 저작권·상표·외부 서비스 고지
└─ package.json                 # 검증 명령과 Node 조건
```

설계상 `.agents/plugins/marketplace.json`이 마켓플레이스 목록의 기준입니다. 각 항목은 `plugins/<플러그인 이름>`의 로컬 폴더만 가리키며, 경로 이탈이나 심볼릭 링크를 허용하지 않도록 검증합니다.

## 12. 보안과 데이터 흐름

### 일반 플러그인 데이터 흐름

```text
사용자 입력과 작업 파일
  → 로컬 Codex 런타임
  → 설치된 로컬 SKILL.md 지침
  → Codex가 허용된 도구로 작업
  → 결과 파일과 응답
```

이 저장소는 자체 로그인, 계정, 권한 서버, 데이터베이스, 분석 수집기 또는 원격 업로드 코드를 제공하지 않습니다. 다만 Codex 자체와 사용자가 연결한 도구의 데이터 처리 정책은 별도입니다.

### Context7을 사용하는 경우

`web-app-team`과 `research-team`만 `.mcp.json`을 포함합니다.

```text
관련 요청
  → Codex가 npx로 @upstash/context7-mcp@4.1.1 실행
  → 필요 시 네트워크를 통해 외부 문서 정보 요청
  → 반환된 자료를 Codex 작업에 사용
```

보안 주의사항:

- `npx`는 처음 실행할 때 npm 레지스트리에서 패키지를 받을 수 있습니다.
- Context7, npm, Codex, 모델 제공자의 약관·개인정보 처리·비용 정책은 이 저장소와 별도입니다.
- 비밀번호, API 키, 토큰, 개인키, 인증서, 주민등록번호, 결제정보, 고객 원문을 프롬프트나 공개 파일에 넣지 마십시오.
- 민감한 사내 코드나 문서를 외부 MCP에 보내도 되는지 조직 정책을 먼저 확인하십시오.
- `.env`, 인증서, 개인키, 계정 파일은 커밋하지 말고 별도 비밀 관리 도구를 사용하십시오.
- AI가 만든 명령은 실행 전에 경로, 삭제 범위, 외부 전송 여부를 확인하십시오.

### 검증기에 포함된 방어

- 마켓플레이스와 스킬 경로가 저장소 밖으로 나가지 못하도록 차단
- 플러그인 아래 심볼릭 링크 차단
- 유효하지 않은 UTF-8 문서 차단
- MCP 구조와 문자열 형식 검증
- 스킬 폴더 이름과 frontmatter 이름 일치 검증
- 예상하지 않은 MCP 선언 차단
- 런타임 의존성 0개 유지 검증
- 경로 이탈, 잘못된 타입, 이름 불일치, MCP 경로 이탈, 잘못된 UTF-8, 잘못된 MCP 구조 등 7개 악성 사례의 차단 테스트

## 13. 파일·문서 위치

| 파일 | 역할 |
|---|---|
| `README.md` | 한국어 Markdown 사용 설명서 |
| `README.en.md` | 영문 Markdown 사용 설명서 |
| `README.html` | 한국어 HTML 사용 설명서 |
| `README.en.html` | 영문 HTML 사용 설명서 |
| `PORTING_REPORT.md` | 원본과 포팅판의 대응 관계, 제외 범위, 검증 근거 |
| `LICENSE` | Apache License 2.0 전문 |
| `NOTICE` | 저작권, 상표, 외부 서비스 주의사항 |
| `.agents/plugins/marketplace.json` | 설치 가능한 11개 플러그인 목록의 기준 |
| `plugins/*/plugin.json` | 각 플러그인의 이름, 버전, 설명, 스킬 경로 |
| `plugins/*/.codex-plugin/plugin.json` | 호환용 매니페스트 |
| `plugins/*/skills/*/SKILL.md` | Codex가 읽는 실제 역할 지침 |
| `plugins/web-app-team/.mcp.json` | 웹앱팀 Context7 설정 |
| `plugins/research-team/.mcp.json` | 리서치팀 Context7 설정 |
| `scripts/validate.mjs` | 전체 구조와 보안 규칙 검증 |
| `test/*.mjs` | 정상·실패·경계·CI 조건 테스트 |

## 14. 개발·검증 방법

프로젝트 최상위 폴더에서 실행합니다.

```powershell
cd "C:\path\to\SoDam-Agent-Codex"
npm run validate
npm test
```

현재 `npm test`는 다음 순서로 실행됩니다.

1. `test/e2e.mjs`: 11개 플러그인 순서와 디렉터리, Context7 고정 버전, 예상하지 않은 MCP 여부
2. `test/adversarial.mjs`: 7개 잘못된 입력이 실제로 거부되는지
3. `test/runtime.mjs`: Node 최소 버전과 Context7 버전 고정
4. `test/ci.mjs`: CI 액션 SHA 고정, 읽기 전용 권한, 시간 제한, Node 22

추가 검증:

```powershell
npm pack --dry-run --json
```

기대 기준:

- 플러그인 11개
- 스킬 46개
- 매니페스트 22개
- 런타임 의존성 0개

이 프로젝트에는 별도 애플리케이션 소스의 lint, TypeScript type check, build 명령이 없습니다. 그것들을 실행하지 않은 것을 통과로 해석하면 안 됩니다. 이 저장소의 배포 산출물은 플러그인·스킬·문서이며, 검증은 그 구조와 정책을 대상으로 합니다.

## 15. 업데이트 내용 요약

<details>
<summary><strong>2026-09-23 — Codex 포팅 기준판</strong></summary>

- 원본 SoDam-Agent 기준 커밋 `34866df`에서 Codex 플러그인 구조로 포팅했습니다.
- 10개 전문팀, 31개 역할 스킬, 10개 팀 조율 스킬을 구성했습니다.
- 사용자 스킬 생성·선택·훈련·저장·제거를 위한 5개 관리 스킬을 추가했습니다.
- 현재 형식과 호환 형식의 플러그인 매니페스트를 함께 제공합니다.

</details>

<details>
<summary><strong>보안·안정성 강화</strong></summary>

- 경로 이탈, 심볼릭 링크, 잘못된 UTF-8, 잘못된 MCP 구조를 거부하도록 검증기를 강화했습니다.
- 정상 입력뿐 아니라 7개 악성·오류 사례가 차단되는지 테스트합니다.
- Context7 MCP를 필요한 두 플러그인에만 제한하고 버전을 `4.1.1`로 고정했습니다.
- 프로젝트 런타임 의존성을 0개로 유지하도록 검사합니다.

</details>

<details>
<summary><strong>런타임·CI 검증</strong></summary>

- Node.js 최소 버전을 `20.18.1`로 명시하고 검증합니다.
- GitHub Actions는 Node 22에서 `npm test`를 실행하도록 구성했습니다.
- CI 액션은 전체 커밋 SHA로 고정하고, `contents: read`, 10분 시간 제한, 중복 실행 취소 설정을 검사합니다.

</details>

<details open>
<summary><strong>문서 확장</strong></summary>

- 한국어·영문 Markdown과 HTML 문서를 같은 원문 기반으로 제공합니다.
- 초보자용 다운로드, 설치, 빠른 시작, 명령어, 팀별 예시, 보안·데이터 흐름, 오류 대처, FAQ, 라이선스·상업적 이용 조건을 추가했습니다.
- 확인된 내용과 실제 설치·외부 통신처럼 미확인인 내용을 명확히 구분했습니다.

</details>

## 16. 문제·오류 대처

### `codex` 명령을 찾을 수 없음

재현: `codex --version` 실행 시 “명령을 찾을 수 없음” 또는 비슷한 메시지가 나옵니다.

대처:

1. Codex CLI가 설치되어 있는지 확인합니다.
2. 터미널을 완전히 닫고 다시 엽니다.
3. Codex 설치 경로가 운영체제의 PATH에 포함되었는지 확인합니다.
4. [OpenAI Codex 공식 저장소](https://github.com/openai/codex)의 현재 설치 지침과 비교합니다.

### Node.js 버전이 낮음

재현: `node --version`이 `v20.18.1`보다 낮거나 `npm test`가 engine 오류를 냅니다.

대처: Node.js 공식 설치 프로그램으로 지원 버전을 설치한 뒤 새 터미널에서 버전을 다시 확인합니다. 여러 Node 버전을 사용하는 경우 실제 PATH가 어느 실행 파일을 가리키는지도 확인합니다.

```powershell
node --version
Get-Command node
```

### 마켓플레이스를 찾지 못함

재현: `codex plugin add ...@sodam-agent-codex`가 마켓플레이스를 찾지 못합니다.

대처:

```powershell
codex plugin marketplace list
```

- 로컬 설치라면 폴더가 실제 존재하는지 확인하고 절대 경로로 다시 등록합니다.
- GitHub 설치라면 저장소 공개 여부, 철자, 네트워크, 접근 권한을 확인합니다.
- 원본 `SoDam-Agent`와 포팅판 `SoDam-Agent-Codex`를 혼동하지 않았는지 확인합니다.

### 플러그인이 목록이나 화면에 보이지 않음

1. `codex plugin list --marketplace sodam-agent-codex`로 설치 상태를 확인합니다.
2. 플러그인 이름 철자를 확인합니다.
3. 새 Codex 작업을 열거나 앱을 다시 시작합니다.
4. 그래도 안 되면 `codex plugin --help`의 현재 명령 형식과 이 문서 명령을 비교합니다.

### Context7 또는 `npx` 실행 실패

가능한 원인: Node 버전 부족, 인터넷 또는 npm 레지스트리 차단, 프록시·방화벽, 패키지 다운로드 실패, 외부 서비스 장애입니다.

확인:

```powershell
node --version
npx --version
npm view @upstash/context7-mcp@4.1.1 version
```

마지막 명령은 네트워크에 연결되며 조직 정책에 따라 차단될 수 있습니다. 민감한 프록시 비밀번호나 토큰을 오류 보고서에 붙여 넣지 마십시오. Context7이 없어도 다른 로컬 역할 지침은 사용할 수 있지만, 최신 외부 문서 조회가 필요한 작업은 제한될 수 있습니다.

### `npm test` 실패

1. 실패한 첫 메시지를 생략하지 말고 읽습니다.
2. `npm run validate`로 구조 오류인지 먼저 확인합니다.
3. 최근 변경한 `marketplace.json`, `plugin.json`, `.mcp.json`, `SKILL.md`를 확인합니다.
4. 테스트 통과를 위해 검증 규칙이나 기능을 삭제하지 마십시오.
5. 수정 후 `npm test` 전체를 다시 실행합니다.

### 권한 또는 백신 오류

- 프로젝트를 시스템 보호 폴더가 아닌 사용자 작업 폴더에 둡니다.
- 관리자 권한을 무조건 사용하지 말고, 어떤 파일이 차단되었는지 먼저 확인합니다.
- 보안 프로그램 예외를 넓게 추가하지 말고 필요한 경로와 실행 파일만 조직 정책에 따라 검토합니다.

### 스마트폰에서 설치가 안 됨

정상적인 한계입니다. 이 프로젝트는 Codex CLI를 실행하는 컴퓨터용입니다. 스마트폰에서는 README 열람과 원격 저장소 확인 정도만 가능하며, 로컬 플러그인 설치·검증은 컴퓨터에서 수행하십시오.

## 17. FAQ

### Q1. 무료인가요?

저장소 코드는 Apache-2.0으로 제공됩니다. 다만 Codex, AI 모델, Context7, 네트워크 또는 다른 연결 서비스의 이용료와 약관은 별도일 수 있습니다.

### Q2. 모든 플러그인을 설치해야 하나요?

아닙니다. 필요한 팀만 설치할 수 있습니다. 처음에는 `docs-team` 또는 업무에 맞는 팀 하나로 시작하는 것을 권장합니다.

### Q3. 설치하면 자동으로 제 파일을 전부 읽나요?

이 저장소 자체에는 전체 컴퓨터를 수집하는 코드가 없습니다. 실제 파일 접근은 Codex 세션의 권한, 사용자의 요청, 연결한 도구에 따라 결정됩니다. 작업 전에 접근 범위를 확인하십시오.

### Q4. API 키가 필요한가요?

이 저장소 자체는 API 키를 요구하지 않습니다. Codex와 외부 MCP·서비스는 별도 인증이나 계정이 필요할 수 있습니다. 키를 README, 테스트, 커밋 또는 프롬프트에 남기지 마십시오.

### Q5. `training-agent`가 AI 모델을 학습시키나요?

아닙니다. 사용자 소유 `SKILL.md`의 업무 지침을 안전하게 수정하는 기능입니다. 모델 가중치 학습이나 파인튜닝을 수행하지 않습니다.

### Q6. 플러그인 파일을 직접 고쳐도 되나요?

가능하지만 업데이트 때 덮어써질 수 있습니다. 사용자 맞춤 스킬은 사용자 소유 스킬 폴더에 복사해 관리하고, 변경 전 백업과 변경 후 검증을 권장합니다.

### Q7. 데이터베이스나 로그인 기능이 있나요?

없습니다. 이 저장소는 플러그인 지침 묶음과 검증 도구입니다. 로그인·권한·DB CRUD를 제공하는 서비스가 아니므로 해당 기능 테스트도 대상이 아닙니다.

### Q8. 인터넷 없이 사용할 수 있나요?

이미 설치된 Codex와 로컬 스킬은 환경에 따라 사용할 수 있습니다. 그러나 Codex 모델 접속, GitHub 다운로드, `npx` 패키지 획득, Context7 조회에는 인터넷이 필요할 수 있습니다.

### Q9. 상업 프로젝트에서 써도 되나요?

Apache-2.0 조건을 지키면 이 저장소 코드는 상업적으로 사용할 수 있습니다. 다만 외부 서비스, 입력 자료, 생성 결과, 글꼴·이미지·데이터, 개인정보, 상표에는 별도 권리가 적용될 수 있습니다. 자세한 내용은 다음 법률 절을 확인하십시오.

### Q10. 오류 보고 시 무엇을 보내야 하나요?

운영체제, `codex --version`, `node --version`, 실행 명령, 비밀을 지운 오류 메시지, 재현 순서를 보내십시오. API 키, 토큰, 개인 경로의 민감한 이름, 고객 데이터는 제거하십시오.

## 18. 법률·저작권·라이선스·상업적 이용

### 현재 파일에서 확인한 것

- 이 프로젝트는 `package.json`에 `Apache-2.0`을 지정했고, 최상위 `LICENSE`에는 Apache License, Version 2.0의 공식 본문이 있습니다. Apache Software Foundation이 안내하는 현행 버전은 2.0입니다.
- 기존 저작권 표기는 `Copyright 2026 SoDam AI Studio`이며, 최상위 `LICENSE` 끝의 별도 표기와 `NOTICE`에 보존했습니다. 이 표기만으로 모든 원본 기여물의 권리 귀속이 독립적으로 입증되는 것은 아닙니다.
- 현재 배포 폴더에는 이미지·아이콘·폰트·영상·음원·샘플 데이터 파일과 `node_modules`가 없습니다. `package.json`에 직접 런타임 의존성도 없습니다.
- 웹앱팀과 리서치팀의 `.mcp.json`은 `@upstash/context7-mcp@4.1.1`을 `npx`로 실행하도록 가리킵니다. 패키지는 이 저장소에 포함되지 않습니다. 해당 버전의 npm 라이선스 표기는 MIT이고, [Context7 프로젝트 원문](https://github.com/upstash/context7/blob/master/LICENSE)도 MIT를 표시합니다. 실제 설치되는 하위 패키지 전체의 라이선스와 서비스 이용 조건은 별도 확인이 필요합니다.

### 왕초보용: 어디까지 쓸 수 있나요?

아래의 “가능”은 **권리자가 Apache-2.0으로 제공할 수 있는 이 프로젝트의 코드·문서·프롬프트**에 대한 설명입니다. 외부 서비스, 타인 자료, AI 생성 결과, 상표까지 자동으로 허락한다는 뜻은 아닙니다.

| 하려는 일 | 이 프로젝트에 적용되는 기본 안내 |
|---|---|
| 개인 사용, 회사 내부 사용, 교육 자료 활용 | Apache-2.0 적용 자료는 사용할 수 있습니다. 교육 자료에 외부 저작물을 추가한다면 그 자료의 허락을 따로 확인합니다. |
| 복제, 포크, 수정 | 가능합니다. 수정한 파일을 배포할 때는 변경 사실을 눈에 띄게 표시하고 기존 고지를 보존합니다. |
| 원본 또는 수정본 재배포, 판매, 고객사 납품 | Apache-2.0 적용 자료에 대해 가능합니다. 배포물에 `LICENSE` 사본을 넣고 관련 `NOTICE` 고지를 읽을 수 있게 유지하며, 수정 파일을 표시합니다. 납품 계약의 권리·보증 조항은 별도입니다. |
| 이 도구를 이용한 유료 서비스 운영 | Apache-2.0 자체는 유료 서비스를 금지하지 않습니다. 외부 Codex·Context7·모델 서비스의 약관·요금, 개인정보 처리, 고객 계약은 따로 확인합니다. |

### 반드시 지켜야 할 조건과 해서는 안 되는 일

- 재배포할 때 `LICENSE` 사본을 제공하고, 관련 저작권·특허·상표·귀속 고지와 `NOTICE` 내용을 Apache-2.0 제4조에 맞게 유지합니다. 수정한 파일에는 변경 사실을 표시합니다.
- Apache-2.0은 기여자의 상표 사용권을 주지 않습니다. OpenAI, Codex, Upstash, Context7 등의 이름·로고로 제휴나 보증을 암시하지 마십시오.
- 허락받지 않은 이미지, 아이콘, 폰트, 영상, 음원, 코드, 템플릿, 데이터, 캐릭터, 문서, 프롬프트를 “이 프로젝트 라이선스가 있으니 괜찮다”는 이유로 공개하거나 판매하지 마십시오.
- 고객사 정보, 개인정보, 비공개 자료, API 키, 토큰, 비공개 주소를 샘플·테스트·스크린샷·로그·배포물에 넣지 마십시오. 데모 자료도 실제 자료를 복사하기보다 권리가 확인된 더미 자료를 사용하십시오.
- 이 저장소의 Apache-2.0을 외부 MCP·SDK·API·모델·npm 패키지나 그 응답 내용에 적용한다고 표시하지 마십시오.
- Apache-2.0에는 특허 허여와 특정 특허 소송 시 허여 종료 조건이 있습니다. 제7조는 보증을 부인하고 제8조는 책임을 제한합니다. 납품 계약에서 별도 보증을 약속할 때는 원문과 계약을 함께 검토해야 합니다.

### 공개·상업화·납품 전 직접 확인할 것

1. 원본 SoDam-Agent와 포팅판의 코드·문서·프롬프트에 대한 실제 저작자, 기여자, 외부 자료 유입 경로, Apache-2.0 허락 권한을 확인합니다. 기존 `NOTICE` 표기만으로 권리 사슬을 확정하지 않습니다.
2. AI가 만든 코드·문서·이미지·콘텐츠를 사용한다면 입력 자료의 권리, 생성 서비스의 현재 정책, 유사 저작물 침해 가능성, 사람의 최종 검수를 확인합니다. AI 생성물의 독점적 저작권이나 상업적 안전성을 보장하지 않습니다.
3. `SoDam-Agent`와 `SoDam-Agent-Codex` 명칭을 브랜드로 쓸 경우 출시 국가의 공식 상표 검색과 전문가 검토를 받습니다. 로고 사용권도 별도로 확인합니다.
4. Codex, Context7, npm 및 연결할 외부 API·SDK·모델의 현재 약관, 상업용 요금제, 데이터 처리·보관 정책을 확인합니다. `npx`는 Context7과 하위 패키지를 실행 시 내려받을 수 있으며, 하위 버전은 현재 저장소에서 잠그지 않습니다.
5. 나중에 이미지·아이콘·폰트·영상·음원·템플릿·샘플 데이터를 추가한다면 파일별 출처, 저작권자, 라이선스, 상업적 이용 범위, 수정·재배포 가능 여부와 증빙을 기록합니다. 번들 패키지를 추가하면 전체 의존성의 라이선스와 NOTICE 의무를 다시 검사합니다.
6. 납품·공개 직전 실제 배포 파일에서 비밀·개인정보·고객 자료를 다시 검사하고, 계약서의 권리 귀속·면책·보증·지원·데이터 처리 조항을 확인합니다.

**법무/전문가 검토 필요:** 원본과 포팅판의 기여자별 권리 사슬, 브랜드·상표 충돌, 국가별 개인정보·계약 의무, AI 생성 결과의 권리·유사성, 실제 납품 계약의 보증 범위는 현재 파일만으로 확정할 수 없습니다. Context7의 하위 의존성·서비스 약관도 실제 배포·운영 방식에 맞춰 재검토해야 합니다.

> **법률 면책:** 이 설명은 참고용·법적 효력 보장 안 함, 사용자 책임·변호사 확인 권장입니다. 최종 사용·공개·배포·상업화 전에 관할 지역의 전문가에게 확인하십시오.

## 19. 현재 한계와 미확인 항목

다음 항목은 문서 작성 시점에 확인하지 않았거나 이 프로젝트의 범위가 아닙니다.

- 사용자 Codex 설정에 마켓플레이스 등록과 11개 플러그인 실제 설치: **미실행**
- 설치 후 실제 자연어 요청이 각 팀 스킬을 선택해 끝까지 수행하는지: **미실행**
- Context7 MCP 초기화 협상과 실제 문서 질의: **미실행**
- `actionlint` 별도 검사: 도구가 없어 **미실행**
- 웹 UI, 모바일 UI, 로그인, 인증, 권한 API, 데이터베이스 CRUD, 서버 로그, 브라우저 콘솔: 해당 기능이 없어 **대상 아님**
- macOS·Linux 실기기 설치와 경로 호환성: **미확인**

정적·로컬 테스트 통과는 실제 사용자 설치와 외부 서비스 통신 성공을 대신하지 않습니다. 실제 운영 전에 별도 테스트용 Codex 환경에서 설치→목록 확인→팀별 대표 요청→제거→재설치 흐름을 확인하는 것이 안전합니다.

## 20. 업데이트·기여 체크리스트

플러그인이나 스킬을 추가·수정할 때 다음 순서를 따릅니다.

1. 관련 `AGENTS.md`, `package.json`, 기존 매니페스트와 스킬을 먼저 읽습니다.
2. `.agents/plugins/marketplace.json`과 실제 플러그인 폴더의 이름·순서를 맞춥니다.
3. `plugin.json`과 `.codex-plugin/plugin.json`을 동일하게 유지합니다.
4. 새 스킬 폴더 이름과 `SKILL.md`의 frontmatter `name`을 맞춥니다.
5. 비밀, 개인 정보, 로컬 전용 경로, 캐시, 로그를 포함하지 않습니다.
6. 외부 MCP는 필요한 플러그인에만 선언하고 버전을 고정합니다.
7. `npm run validate`와 `npm test`를 모두 실행합니다.
8. `npm pack --dry-run --json`으로 배포 파일 목록을 검토합니다.
9. README 네 파일과 `PORTING_REPORT.md`, `NOTICE`를 변경 내용에 맞게 갱신합니다.
10. 실제 사용자 설치 테스트와 외부 통신 테스트 결과를 통과·실패·미실행으로 구분해 기록합니다.

기능을 없애서 테스트를 통과시키거나, 실패한 테스트를 무시하거나, 관련 없는 대규모 리팩터링을 하지 마십시오.

## 21. 원본과 출처

- 원본 프로젝트: [sodam-ai/SoDam-Agent](https://github.com/sodam-ai/SoDam-Agent)
- Codex 포팅 저장소: [sodam-ai/SoDam-Agent-Codex](https://github.com/sodam-ai/SoDam-Agent-Codex)
- 포팅 기준 원본 커밋: `34866df`
- 저작권: Copyright 2026 SoDam AI Studio
- 라이선스: Apache License 2.0 — 상세 조건은 `LICENSE`와 `NOTICE` 참조

문서의 명령은 현재 로컬 Codex CLI 도움말, 프로젝트의 `package.json`, 매니페스트, 테스트, CI 설정을 기준으로 작성했습니다. 설치 전에는 사용 중인 Codex 버전의 `codex plugin --help`를 함께 확인하십시오.
