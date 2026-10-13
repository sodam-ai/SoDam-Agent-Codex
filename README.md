# SoDam-Agent-Codex

<!-- Modified 2026-10-13 by SoDam AI Studio: beginner-oriented README restructure and synchronized HTML. -->

**한국어** | [English](README.en.md) · [HTML](README.html)

> Codex에 역할별 AI 업무 지침을 추가하고, 검증한 경험을 다음 업무에 활용하는 플러그인입니다. **12개 플러그인·56개 스킬**, 버전 **0.3.9와 현재 보강 코드**를 제공합니다.

컴퓨터에서 Codex를 열고 평소처럼 업무를 요청합니다. 아래의 설치 → 빠른 시작 → 자동 운영 순서로 따라 하세요. 스마트폰은 문서 열람에 사용할 수 있지만 이 로컬 플러그인의 모바일 실행은 검증하지 않았습니다.

## 목차

0. [현재 버전·업데이트 요약](#section-0)
1. [SoDam-Agent-Codex란?](#section-1)
2. [사전 준비물·필요 프로그램](#section-2)
3. [다운로드 방법](#section-3)
4. [설치 방법](#section-4)
5. [빠른 시작](#section-5)
6. [팀과 관리 도구 전체 목록](#section-6)
7. [실행·사용 방법](#section-7)
8. [자동 학습·에이전트 운영](#section-8)
9. [명령어 모음](#section-9)
10. [워크플로우](#section-10)
11. [파일·문서 위치](#section-11)
12. [문제·오류 대처](#section-12)
13. [FAQ — 자주 묻는 질문](#section-13)
14. [보안·데이터 흐름](#section-14)
15. [폴더 구조·아키텍처](#section-15)
16. [개발·테스트·배포 방법](#section-16)
17. [업데이트·기여 방법](#section-17)
18. [법률·저작권·라이선스·상업적 사용](#section-18)
19. [현재 한계·미확인](#section-19)
20. [원본·출처](#section-20)

---

<a id="section-0"></a>

## 0. 현재 버전·업데이트 요약

현재 구성은 **12 / 56 / 24** (플러그인 / 스킬 / 매니페스트). 정확한 버전은 package.json, 세부 기능은 아래 설치·자동 운영 장을 확인하세요. 기술 시험과 실제 사용 효과는 구분합니다.

<details open>
<summary>최신 보강 — 눌러서 접기</summary>

- 직접 끌 때까지 유지하는 공통 자동 운영과 별도 기존 정책 이전.
- 활성·비활성 상태 표시, 검증된 교훈 저장·관련 재사용.
- 역할 생성·개선 후보 시험, 실패 비활성화·복귀, 완료 기록 보관.
- 실패 기록 보존·후속 해결 증거 연결, 실제 역할 파일 읽기·해시 검토를 보강했습니다.
- 격리된 26개 시험 스크립트와 별도 설치 경로 시험. 모든 새 채팅·장기 개선 효과를 보장하는 것은 아닙니다.

</details>

<details>
<summary>이전 버전 변경 이력</summary>

<h3 id="autonomy-039">0.3.9 Windows MCP 설치 폴더 잠금 해소 (2026-10-09)</h3>

MCP 실행 위치를 안정된 Node 실행 폴더로 옮겨 Windows 설치 캐시의 작업 위치 잠금을 방지합니다. 프로젝트 절대 경로·권한 검사는 유지하며 훅 정의는 변경하지 않습니다. 기존 실행 프로세스의 재연결과 실제 Desktop 자동 흐름은 별도로 확인해야 합니다.

<h3 id="autonomy-038">0.3.8 같은 평가 과제의 방식 비교 연결 (2026-10-09)</h3>

기존 방식과 후보 방식을 서로 다른 대화에서 실행해도 선택적 evaluationTaskId로 같은 평가 과제에 연결할 수 있습니다. 대화별 실행 증거와 경험은 각각 보존하고 분야·역량·목표가 다른 요청은 거부합니다. 동일 입력과 실제 품질 향상은 별도 검증이 필요하며 Desktop 자동 훅 실행 완료를 뜻하지 않습니다.

<h3 id="autonomy-037">0.3.7 내부 명령 실패 기록 보강 (2026-10-09)</h3>

MCP 응답 전달 성공과 내부 명령 성공을 구분합니다. 제한된 JSON 메타데이터의 실패·시간 초과는 실패로, 과대·잘못된 상태는 미확인으로 기록합니다. 실패 응답 원문은 저장하지 않습니다. 실제 CLI·Desktop 전체 흐름 및 역할 개선 효과는 별도 사용 검증이 필요합니다.

<h3 id="autonomy-036">0.3.6 구조화된 조율과 완료 기록 (2026-10-09)</h3>

승인된 프로젝트에서 조율 시작과 완료 기록을 구조화된 MCP 입력으로 호출할 수 있습니다. verified 완료는 의미 재읽기 확인, 실제 산출물 검사, 실행 증거와 미해결 실패 없음이 필요합니다. 기존 CLI와 실패 기록을 보존하며, 작업 종류만 지정한 경험 조회도 지원합니다. 실제 자동 선택·재사용·역할 개선 효과는 별도 사용 시험으로 판정합니다.

<h3 id="autonomy-035">0.3.5 읽기 전용 산출물 검증 (2026-10-09)</h3>

승인된 프로젝트의 문서 파일을 직접 검사하고 실행 상태·해시만 반환하는 읽기 전용 MCP를 추가했습니다. 위험 경로·연결 파일·승인 만료·크기 초과·알려진 비밀정보 형태는 거부합니다. 의미 검수는 별도로 필요하며, 실제 Codex 연결·새 대화의 검증된 경험 재사용은 별도 사용 시험이 필요합니다.

<h3 id="autonomy-034">0.3.4 잘못된 옵션과 기록 보존 수정 (2026-10-09)</h3>

gap·excludedKinds 옵션의 빈 문자열·0·false·null을 누락된 값으로 취급하지 않고 검증합니다. 잘못된 요청은 분류 기록이나 경험 상태를 변경하기 전에 거부합니다. 기존 정상 요청과 기록은 보존하며, 실제 자동 사용 검증은 별도로 진행해야 합니다.

<h3 id="autonomy-033">0.3.3 관련 경험 선택과 역할 무결성 보강 (2026-10-09)</h3>

작업 종류와 역량 부족 항목이 맞는 경험을 먼저 선택한 뒤 최대 3개를 재사용합니다. 다른 종류의 최근 작업 때문에 필요한 경험이 누락되는 문제를 수정했습니다. 회상에 포함할 활성 역할의 파일·해시·정본도 검증하며 변조된 역할은 중단하고 검토하도록 합니다. 기존 경험과 역할을 삭제하지 않습니다. 실제 Codex 자동 실행과 업무 품질 향상은 별도 검증이 필요합니다.

<h3 id="autonomy-032">0.3.2 제한된 유지보수 및 훅 호환성 수정 (2026-10-09)</h3>

실행 한도·시간 초과·중복 실행·복구 및 Interrupt 호환성을 보강했습니다. 상세 제한과 미확인 범위는 [자동 조율 안내](docs/AUTONOMY.md)를 확인하십시오. 실제 자동 업무·개선 효과가 검증됐다는 뜻은 아닙니다.

<h3 id="autonomy-030">0.3.0 자동 연결·검증된 경험 재사용 (2026-10-09)</h3>

기존 11개 플러그인·46개 스킬을 보존한 총 **12개 플러그인·56개 스킬**입니다. autonomy-team에 프로젝트 승인 기반 SessionStart·UserPromptSubmit·PostToolUse·Stop·Interrupt 훅과 dispatch/finish 연결을 추가했습니다. 실제 도구 이벤트·측정 시간·산출물 해시를 기록하고, 확인된 절차를 다음 관련 작업에서 다시 검증해 재사용합니다. 반복 역량 부족은 제한된 업무별 절차를 가진 역할 후보로 보강합니다.

[사용법·신뢰 설정·정확한 한계](docs/AUTONOMY.md)를 읽으십시오. `codex plugin add autonomy-team@sodam-agent-codex`로 설치한 후 Codex의 `/hooks`에서 실제 정의를 검토해 신뢰해야 합니다. 설치만으로 훅은 실행되지 않습니다. Desktop과 CLI는 사용 프로필과 실제 새 대화에서 각각 확인해야 합니다.

기본 모델을 재학습하지 않으며, 상시 백그라운드 실행기는 없습니다. 설치된 관련 스킬과 현재 도구 권한 안에서 실행합니다. 생성 역할은 시험 적용 상태이고 효과는 별도 비교 검증해야 합니다. 훅·파일 해시는 실행·파일 증거이며 의미적 품질 인증이 아닙니다. 로컬 시험과 실제 Codex 자동 사용은 구분합니다. 아래 2026-09-23 설치 기록은 이전 11개 플러그인에 대한 과거 확인입니다.

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
- 정상 입력뿐 아니라 8개 악성·오류 사례가 차단되는지 테스트합니다.
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

<details>
<summary><strong>2026-09-23 — 설치본·저장소 동기화</strong></summary>

- 이 PC의 플러그인 설치 상태에 맞춰 검증 안내를 갱신했습니다.
- 11개 플러그인의 정보 링크를 원본 Claude Code 저장소에서 이 Codex 포팅 저장소로 바로잡고, 갱신이 적용되도록 버전을 올렸습니다.
- Windows에서 Git 복제 시 생기는 CRLF 줄바꿈도 정상 스킬 파일로 검증되도록 수정하고 회귀 테스트를 추가했습니다.
- 팀별 자연어 자동 선택과 외부 MCP 통신은 설치 여부와 별개로 검증 범위를 구분합니다.

</details>

</details>

문서 재편 기준: 2026-10-13. 최신 정본의 기능·명령을 기준으로 구성했으며, 아래 과거 이력은 당시의 기록입니다. 기한 해제와 모든 프로젝트의 실제 학습 효과 검증은 별개입니다.

---

<a id="section-1"></a>

## 1. SoDam-Agent-Codex란?

이 프로젝트는 **Codex 안에 전문가별 업무 설명서를 추가하는 도구 상자**입니다. 예를 들어 `docs-team`을 설치한 뒤 “문서팀으로 초보자 안내서를 작성해줘”라고 요청하면, 문서 작성·편집·사실 확인 역할의 지침을 작업에 적용합니다.

알아둘 점은 다음과 같습니다.

- 자동으로 모든 팀이 항상 실행되는 것은 아닙니다. 설치한 플러그인과 요청 내용에 따라 필요한 스킬을 사용합니다.
- 팀 스킬은 작은 요청이면 필요한 역할만 사용합니다.
- 사용자가 팀 작업이나 병렬 처리를 명시적으로 요청하지 않는 한 서브에이전트를 자동으로 만들지 않습니다.
- 삭제, 배포, 외부 전송처럼 영향이 큰 작업은 사용자 권한과 확인이 필요합니다.
- AI 결과는 검토가 필요합니다. 특히 법률, 보안, 개인정보, 배포 결과는 사람의 최종 확인이 필요합니다.

### 처음 접하는 용어

| 용어 | 쉬운 뜻 |
|---|---|
| 프로젝트 폴더 | 한 작업의 파일을 모아 놓은 장소입니다. |
| 터미널 / PowerShell | 명령어를 입력해 프로그램에 일을 시키는 창입니다. Windows 시작 메뉴에서 PowerShell을 검색할 수 있습니다. |
| Node.js / npm | 여기의 JavaScript 도구를 실행하는 프로그램과 함께 제공되는 관리 명령입니다. |
| Codex | 실제 요청을 받고 AI 작업을 수행하는 실행 환경입니다. 이 저장소만 다운로드하면 AI가 실행되는 것은 아닙니다. |
| 플러그인 / 스킬 | Codex에 추가하는 기능 묶음 / 작업 절차를 적은 문서입니다. |
| 훅 | 요청 시작이나 도구 종료 등 특정 시점에 연결되는 처리입니다. 설치와 신뢰 승인이 별개입니다. |
| MCP | Codex가 별도 도구 프로세스와 요청·응답을 주고받는 연결 방식입니다. |
| 작업 중 학습 | 작업 증거와 교훈을 저장하고 관련 후속 작업에서 참고하는 기능입니다. AI 모델 자체의 학습 가중치를 바꾸는 기능은 아닙니다. |

---

<a id="section-2"></a>

## 2. 사전 준비물·필요 프로그램

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
   - autonomy-team의 로컬 실행기와 웹앱팀·리서치팀의 Context7 MCP에 필요하며, 이 저장소의 검증 명령에도 사용합니다.

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

---

<a id="section-3"></a>

## 3. 다운로드 방법

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

---

<a id="section-4"></a>

## 4. 설치 방법

설치는 두 단계입니다. 먼저 **마켓플레이스**를 등록하고, 그다음 원하는 **플러그인**을 추가합니다.

### 4.1 로컬 폴더를 마켓플레이스로 등록

Windows PowerShell 또는 터미널에서 실행합니다. 아래 예시 경로를 실제 프로젝트 폴더 경로로 바꾸십시오.

```powershell
codex plugin marketplace add "C:\path\to\SoDam-Agent-Codex"
```

등록 확인:

```powershell
codex plugin marketplace list
```

목록에서 `sodam-agent-codex`를 찾습니다.

### 4.2 GitHub 마켓플레이스 등록

```powershell
codex plugin marketplace add sodam-ai/SoDam-Agent-Codex --ref main
```

이 명령이 실패하면 저장소가 아직 없거나 비공개이거나, 네트워크 또는 접근 권한 문제가 있을 수 있습니다.

### 4.3 원하는 플러그인 추가

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

### 4.4 12개 플러그인을 모두 추가하려는 경우

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
codex plugin add autonomy-team@sodam-agent-codex
```

설치 후 현재 Codex 화면에서 바로 보이지 않으면 새 작업을 열거나 Codex를 다시 시작한 뒤 목록을 확인합니다. 앱 버전에 따라 표시 위치나 이름 형식이 다를 수 있습니다.

---

<a id="section-5"></a>

## 5. 빠른 시작

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

자동 학습도 사용하려면 `codex plugin add autonomy-team@sodam-agent-codex`로 추가한 뒤 [8장](#section-8)의 공통 자동 운영을 한 번 설정하세요. 이미 활성 상태인 PC에서는 다시 설정할 필요가 없습니다.

---

<a id="section-6"></a>

## 6. 팀과 관리 도구 전체 목록

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

### 자동 조율·학습 플러그인 1개

`autonomy-team`은 자동 조율, archviz/cad/comfyui 전문 보강, 에이전트 생성·시험·검수·복귀 스킬 총 10개와 로컬 훅·MCP 실행기를 제공합니다. 정확한 이름은 `.agents/plugins/marketplace.json`과 `plugins/autonomy-team/skills/`를 확인하세요.

---

<a id="section-7"></a>

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

---

<a id="section-8"></a>

## 8. 자동 학습·에이전트 운영

<!-- automatic-operation-start -->
한 번 명시적으로 켠 공통 자동 운영은 **직접 끌 때까지 유지**됩니다. 새 채팅·다른 업무 프로젝트에서도 신뢰된 시작 훅이 현재 위치를 확인하면 자동 연결합니다. 매주 다시 켜는 방식이 아닙니다. 기존 기간제 프로젝트·영역은 자동 이전하지 않으므로 별도 이전 여부를 확인합니다. 저장·역할·재시도 한도와 파일 접근 권한은 계속 적용됩니다.
<!-- automatic-operation-end -->

### 처음 한 번 설정하기

설치 후 `autonomy-team/hooks/hooks.json`과 연결 실행 파일을 검토하고, 사용하는 Codex의 훅 신뢰 절차를 따르세요. 다른 플러그인을 일괄 신뢰하는 뜻은 아닙니다. CLI와 Desktop의 실제 연결은 각각 확인합니다.

일반 사용자는 Codex 채팅에 다음과 같이 요청할 수 있습니다. “SoDam의 공통 자동 운영과 에이전트 자동 시험 적용을 끌 때까지 켜줘. 현재 설치 경로와 설정을 확인하고 기존 기록을 보존해줘.” 실제 도구와 권한이 있어야 설정할 수 있으며 요청 문장만으로 활성화가 증명되지는 않습니다.

직접 설정하려면 **업무 프로젝트 안**에 `automatic-enable.json`을 만들고 다음 내용을 저장합니다. 이 숫자는 예시 한도이며 기간을 뜻하지 않습니다.

```json
{"authorize":true,"enabled":true,"autoPilot":true,"maxAgents":8,"maxExperiences":200,"maxRetries":1}
```

아래의 설치 위치와 업무 프로젝트 경로를 실제 경로로 바꾸세요. 명령은 터미널에, JSON은 파일에 넣습니다. 개인 승인 파일을 공개 저장소에 올리지 마세요.

```powershell
node "설치 위치/runtime/cli.mjs" automatic-configure "업무 프로젝트 절대 경로" automatic-enable.json
node "설치 위치/runtime/cli.mjs" automatic-inspect
node "설치 위치/runtime/cli.mjs" diagnose "업무 프로젝트 절대 경로"
```

설치 위치는 실제 `autonomy-team` 폴더입니다. 다운로드 원본으로 실행할 경우 `plugins/autonomy-team/runtime/cli.mjs`를 사용합니다. 공통 설정은 현재 PC 사용자의 홈 아래 `.sodam-agent-automatic/policy.json`에 저장됩니다. 기존 독립 프로젝트는 `automatic-adopt`, 기존 승인 영역은 `area-persistent`로 명시적으로 이전합니다. 상세 입력과 되돌리기는 [자동 운영 안내](docs/AUTOMATIC_OPERATION.md)를 따릅니다. 기간제 모드를 선택한 기존 정책은 그 기간이 유지됩니다.

### 끄기·상태 확인

`automatic-disable.json`에 `{"authorize":true,"enabled":false}`를 저장하고 위 `automatic-configure` 명령의 마지막 파일명을 바꾸면 다음 정책 검사부터 중지합니다. 기록은 보존합니다. 다시 켤 때는 enable 파일을 사용합니다.

일반 응답에는 다음 상태줄을 표시합니다.

> [소담 에이전트: 활성 · 자동 학습 켜짐 · 에이전트 자동 시험 적용 켜짐]

활성은 정책·한도가 업무를 허용한다는 뜻입니다. 작업 완료나 개선 효과를 증명하는 배지는 아닙니다. 비활성·대기·한도 도달·미확인도 구분하며, 앱에 고정된 버튼이 아니라 답변 속 표시입니다.

### 학습·자동 시험·역할 관리

학습은 **검증한 경험을 절차로 저장하고 다음 관련 업무에서 활용**하는 것입니다. AI 모델 자체를 다시 훈련하지 않습니다. 자동 시험 적용은 근거가 충족된 새 역할·개선 역할을 `pilot` 후보로 사용해 보는 기능입니다. 모든 역할이 매번 생성되거나 실행되는 뜻은 아닙니다.

실제 결과 재읽기 → 검사 → 교훈 저장 → 관련 후속 요청에서 조건 확인·적용 순서입니다. 반환만 된 교훈과 실제 적용은 구분합니다. 환경·권한 오류는 실력 부족으로 학습시키지 않습니다. 교훈만으로 충분하면 역할을 늘리지 않고, 기존 확정 역할 개선을 먼저 검토합니다. 별도 역할이 필요하면 중복·필요성·관리 부담의 근거를 기록합니다. 실제 수정 1건의 산출물·품질 검사와 역할 검토가 갖춰지면 시험 후보를 만들 수 있습니다. 검토 없는 기존 제안은 별도 업무 2건 기준을 유지합니다. 후보 확정에는 생성 근거와 별개의 두 비교 과제, 같은 품질 기준, 절차 실행 증거가 필요합니다. 수정 횟수·검토 판단은 작업자의 보고이며 독립 품질 보증이 아닙니다. 실패 후보는 비활성화하고 이전 검증 역할로 복귀하며 이력은 보존합니다. 사용자가 관리 명령으로 직접 끈 버전은 승인 후 복구할 수 있지만, 품질 실패로 꺼진 버전을 근거 없이 다시 켜지는 않습니다.

**최신 정본의 역할 검토:** 새 역할·개선 역할을 검토할 때 `review-role`로 실제 등록된 파일을 읽고 내용 해시를 기록합니다. 역할 이름만 적거나 파일이 바뀐 과거 검토로 수정 1건의 후보 생성 기준을 충족할 수 없습니다. 파일을 읽었다는 기록도 절차 실행·품질 향상 증거는 아닙니다. 설치 캐시에 여러 버전이 있어 파일을 정할 수 없으면 임의로 선택하지 않습니다.

**실패를 보존한 해결 확인:** `resolve-failure`는 같은 요청 안의 실제 실패 사건과 그 뒤의 성공한 업무 도구 사건을 검수한 결과 파일에 연결합니다. 파일이 바뀌거나 근거가 부족하면 성공 완료로 처리하지 않습니다. 실행기는 사건 순서·파일 일치를 확인하고, 의미상 해결 여부는 작업자가 직접 검수합니다. 환경·권한 오류를 새 에이전트가 필요한 실패로 바꾸지 않습니다.

처음 사용하는 분은 Codex에 **“오류 기록을 보존하고 실제 해결 결과를 확인해줘. 미해결이면 성공이나 학습 완료라고 표시하지 마”**라고 요청하면 됩니다. 아래 개발용 명령을 매번 직접 작성할 필요는 없습니다. 자동 학습 켜짐과 실제 교훈 저장 완료는 따로 확인하세요.

공통 운영을 켜도 **프로젝트 간 자료 공유가 켜지는 것은 아닙니다.** 검수된 일반 절차만 별도 영역 공유 동의와 업무 조건이 맞을 때 조회합니다. 원본·개인정보·고객 자료는 공유하지 않습니다. [교차 프로젝트 안내](docs/CROSS_PROJECT_OPERATION.md), [학습 관리 절차](plugins/autonomy-team/reference/learning-management.md)를 읽으세요.

완료 이력은 시작 이벤트에서 해시 검수 후 `.sodam-agent-history/`로 보관할 수 있습니다. 미완료·실패·평가 근거·최근 절차는 유지합니다. 중단된 교체 복구와 재실행 방지가 포함되지만 보관·보호 기록 한도는 남습니다. 모든 과거 교훈을 무제한 검색하는 기능이 아닙니다. 예약 작업은 필요하지 않습니다.

저장량과 에이전트 수는 별도로 확인하며, 기본 80%·95%와 한도 도달 시 단계별 알림을 제공합니다. 같은 단계의 알림은 반복하지 않습니다. 중요한 역할과 중요도를 확인할 수 없는 역할은 보존하고, 용량 때문에 임의로 삭제·통합·끄지 않습니다. 경험 저장 한도에 도달하면 업무 종료와 학습 저장 실패를 구분하여 알립니다. 자세한 규칙과 제한은 [용량·보존 안내](docs/CAPACITY_GOVERNANCE.md)를 확인하세요.

### 업데이트·여러 PC

“소담 에이전트 목록을 보여줘”라고 요청하거나 CLI `agent-list`로 생성 역할·후보·기본 경로를 조회할 수 있습니다. `agent-catalog`는 지정한 여러 프로젝트의 목록을 합쳐 보여줍니다. 보호 사유·검증된 사용·후속 버전과 미확인 영향을 함께 설명하며, `capacity`는 관리 백업까지 포함한 저장량을 보여줍니다. `agent-preview`에서 영향을 확인하고 대상별 승인 후 `agent-manage`로 보호·켜기/끄기·보관/복구합니다. 보관은 공간을 확보하지 않습니다. 기본 경로는 조회 전용이며 PC 전체 자동 검색·통합·영구 삭제는 지원하지 않습니다. [에이전트 관리 방법](docs/AGENT_MANAGEMENT.md)을 확인하세요.

원본 갱신 → 변경 확인 → 설치본 반영 → 기존 MCP 재연결 → 실제 호출 확인 순서입니다. 진단이 `sourceStatus: changed`이면 실행 중인 연결이 예전 코드입니다. 작업을 저장한 후 지원되는 재연결 또는 앱 완전 종료·재실행을 하고 `current`를 확인합니다. 정상 연결 확인 후 같은 이유로 재시작을 반복하지 않습니다. 다른 PC는 설치·프로필·경로·승인을 다시 확인하고 개인 승인 파일을 그대로 복사하지 마세요.

---

<a id="section-9"></a>

## 9. 명령어 모음

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

### 자동 운영·학습 실행기 명령

아래는 저장소 내부의 개발·진단 명령입니다. 일반 사용자는 자연어로 요청해도 됩니다. 쓰기 명령은 승인과 정확한 요청 파일을 먼저 확인해야 합니다.

```powershell
cd "C:\path\to\SoDam-Agent-Codex"
npm run validate
npm test
node plugins/autonomy-team/runtime/cli.mjs diagnose "C:\path\to\WorkProject"
node plugins/autonomy-team/runtime/cli.mjs status "C:\path\to\WorkProject"
```

| 명령 | 기능 / 주의 |
|---|---|
| `diagnose`, `status`, `capacity` | 환경·상태·용량을 확인합니다. 정상 진단이 전체 업무 성공을 뜻하지 않습니다. |
| `capacity-review`, `capacity-rules` | 용량·보호 이유를 조회하거나 명시적으로 승인한 프로젝트별 알림·보호 규칙을 설정합니다. 사용법은 용량·보존 안내를 확인하세요. |
| `agent-list`, `agent-catalog` | 현재 프로젝트 또는 직접 지정한 최대 20개 프로젝트의 목록·상태·추천 근거를 읽습니다. PC 전체 자동 검색은 하지 않습니다. |
| `agent-preview`, `agent-manage`, `agent-recover` | 변경 영향 미리보기, 대상별 승인된 관리, 중단된 저장의 백업 복구입니다. [정확한 요청 형식](docs/AGENT_MANAGEMENT.md)을 먼저 확인하세요. |
| `dispatch`, `finish`, `skip` | 작업 시작·결과 기록·제외 요청 처리입니다. 실제 증거 없이 성공 완료를 기록하지 않습니다. |
| `recall` | 저장 교훈을 조회합니다. 작업에 적합한지 다시 검토합니다. |
| `initialize`, `area-authorize`, `area-revoke`, `area-inspect`, `area-sharing`, `connect`, `workspace-bind` | 프로젝트 승인·영역 승인 및 연결을 관리합니다. 승인 범위를 자동 확대하지 않습니다. |
| `syntax-check` | 제한된 Node 소스 문법 검사입니다. 파일을 실행하거나 앱 기능 전체를 검사하는 명령은 아닙니다. |
| `read-role`, `role-step`, `continue` | 역할과 진행 증거를 확인하고 승인된 작업을 이어갑니다. |
| `review-role` | 실제 등록된 역할 파일을 읽고 해시를 기록합니다. 이름만으로 검토 증거를 만들지 않습니다. |
| `resolve-failure` | 같은 요청의 실패·후속 성공 사건과 검수 파일을 연결합니다. 실패 기록을 지우거나 해결을 자동 인증하지 않습니다. |
| `record`, `plan`, `propose`, `evaluate`, `promote`, `assess`, `rollback`, `cycle` | 경험·개선 후보·평가·승격·되돌림을 처리합니다. 단순 기록만으로 개선을 확정하지 않습니다. |
| `archive`, `restore` | 승인된 상태 보관·복구 절차입니다. 원본 확인과 보존을 우선합니다. |
| `maintenance-authorize`, `maintenance-recover`, `maintenance` | 별도 승인·한도가 있는 유지보수 도구입니다. 일상 사용의 필수 조건이나 예약 실행 권고가 아닙니다. |

요청 파일이 필요한 명령의 형식은 `node plugins/autonomy-team/runtime/cli.mjs <명령> "<작업 절대 경로>" <요청 JSON 파일 경로>`입니다. 꺾쇠 부분은 설명용이며 그대로 실행하지 않습니다. JSON 내용 자체를 파일 경로 자리에 붙여 넣지 않습니다. 각 명령의 필드·한도는 운영 안내를 확인합니다.

### 초보자용: 목록 확인부터 안전한 관리까지

1. Codex에서 관리할 프로젝트를 열고 **“이 프로젝트의 소담 에이전트 목록과 보호 이유를 보여줘”**라고 요청합니다. 목록 조회는 삭제나 비활성화를 하지 않습니다.
2. 이름을 골라 **“이 에이전트의 역할·최근 기록·추천 이유·다른 기능에 미치는 영향을 설명해”**라고 요청합니다. 기록에 없는 사용은 미확인입니다. 표시된 횟수는 현재 기록의 횟수이며 전체 사용 기간의 합계가 아닙니다.
3. 변경하려면 **“이 에이전트를 끄기 전에 영향과 백업 절차부터 보여줘”**라고 요청합니다. 미리보기에서 이름·방법·보호 사유·차단 사유를 확인합니다. 모르는 외부 의존 관계는 안전하다고 가정하지 않습니다.
4. 확인한 대상과 방법을 승인하면 변경 전 백업을 저장·재확인한 후 처리합니다. 미리보기 이후 상태가 바뀌면 다시 검토합니다. 보호된 항목·실행 중 항목·핵심 보안/복구 역할은 끄기·보관이 차단될 수 있습니다.
5. 처리 후 상태를 다시 조회합니다. **끄기**는 사용을 중지하고, **보관**은 원본을 유지한 상태 변경이며, **복구**는 보관 전 상태를 되돌립니다. 끄기·보관은 디스크 공간을 비우지 않습니다. 통합·영구 삭제는 지원하지 않습니다.

명령으로 읽기만 하려면 저장소 폴더에서 다음을 실행합니다. `C:\Work\MyProject`는 실제 존재하는 자신의 작업 폴더 경로로 바꿉니다.

```powershell
node plugins/autonomy-team/runtime/cli.mjs agent-list "C:\Work\MyProject"
node plugins/autonomy-team/runtime/cli.mjs capacity "C:\Work\MyProject"
```

여러 프로젝트는 **“내가 지정한 두 프로젝트의 목록과 추천 이유를 보여줘”**라고 요청하고 정확한 경로를 지정합니다. 자동으로 PC 전체를 뒤지거나 다른 프로젝트의 승인을 만들지 않습니다. 일부 프로젝트 조회에 실패하면 그 부분은 미확인으로 남습니다. `/sodam-agent`는 예시 표현이며 호스트에 등록된 슬래시 명령이 아닙니다.

저장량에는 역할 파일·관리 백업·보관된 학습 이력이 포함됩니다. 외부 임의 폴더와 디스크 전체 여유 공간은 측정하지 않습니다. 한도 알림을 받으면 사용량·보호 대상·추천 근거부터 확인하세요. 응답하지 않았다는 이유로 중요한 에이전트나 교훈을 정리하지 않습니다.

### 설정·연결 오류를 만났을 때

- 이 저장소 자체를 검사하는 데 API 키나 `.env` 파일을 새로 만들 필요는 없습니다. 연결한 외부 서비스가 요구하는 인증은 그 서비스의 안내를 따르고 비밀 값을 문서에 붙이지 않습니다.
- 설치 파일을 바꿨는데 `source-changed` 또는 실행 중 코드 불일치가 나타나면 진행 중인 업무를 저장한 뒤 Codex를 완전히 종료·재실행하고 MCP를 재확인합니다. 파일 해시 일치와 실행 중 서버의 최신 코드 일치는 별도 확인입니다.
- 중단된 에이전트 변경은 추가 수정을 멈추고 [백업 복구 절차](docs/AGENT_MANAGEMENT.md)를 따릅니다. 복구 실패 시 잠금·중단 기록을 임의로 지우지 않습니다.
- 과거 기간제 승인과 현재 지속 설정은 구분합니다. 직접 끌 때까지 유지하는 설정은 [자동 운영 안내](docs/AUTOMATIC_OPERATION.md)를 확인하세요. 호스트 권한·프로젝트 접근 제한까지 없어지는 설정은 아닙니다.

기간 없는 공통 설정: `automatic-configure`, `automatic-inspect`, `automatic-adopt`, `automatic-restore`, `area-persistent`. 설정 요청 파일과 실행 예시는 8장을 따릅니다.

---

<a id="section-10"></a>

## 10. 워크플로우

자동 학습이 실제로 수행될 때는 **요청 시작 등록 → 업무 시작 기록 → 실제 업무 → 결과물 검수 → 근거 있는 경험·교훈 저장 → 다음 업무에서 관련 교훈 선택·검토 → 적용 후 결과 확인** 순서입니다. 교훈을 반환받았다는 것만으로 적용·개선 효과가 입증되지는 않습니다. 여기서 학습은 절차·경험·역할 지침 관리이며 AI 모델 자체를 재훈련한다는 뜻은 아닙니다. 필요한 역할을 만들거나 개선해도 기술 시험과 실제 업무 효과를 구분합니다. 예약 작업은 필요하지 않습니다.

프로젝트의 `.sodam-agent/`에는 운영 상태·경험·역할·백업 등 비공개 기록이 생길 수 있습니다. 이 폴더와 개인 공통 설정을 GitHub·납품 파일에 넣지 마세요. 프로젝트 간 공유는 검수된 절차만 대상으로 하며 원문·고객 정보·비밀을 그대로 공유하지 않습니다. 외부 MCP나 API를 사용하면 그 도구에 전달되는 자료와 해당 서비스의 데이터 정책도 별도로 확인합니다.

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

---

<a id="section-11"></a>

## 11. 파일·문서 위치

| 파일 | 역할 |
|---|---|
| `README.md` | 한국어 Markdown 사용 설명서 |
| `README.en.md` | 영문 Markdown 사용 설명서 |
| `README.html` | 한국어 HTML 사용 설명서 |
| `README.en.html` | 영문 HTML 사용 설명서 |
| `PORTING_REPORT.md` | 원본과 포팅판의 대응 관계, 제외 범위, 검증 근거 |
| `LICENSE` | Apache License 2.0 전문 |
| `NOTICE` | 저작권, 상표, 외부 서비스 주의사항 |
| `.agents/plugins/marketplace.json` | 설치 가능한 12개 플러그인 목록의 기준 |
| `plugins/*/plugin.json` | 각 플러그인의 이름, 버전, 설명, 스킬 경로 |
| `plugins/*/.codex-plugin/plugin.json` | 호환용 매니페스트 |
| `plugins/*/skills/*/SKILL.md` | Codex가 읽는 실제 역할 지침 |
| `plugins/web-app-team/.mcp.json` | 웹앱팀 Context7 설정 |
| `plugins/research-team/.mcp.json` | 리서치팀 Context7 설정 |
| `plugins/autonomy-team/.mcp.json` | 로컬 sodam-output MCP 설정 |
| `plugins/autonomy-team/hooks/hooks.json` | 호스트 사건 훅 5개 |
| `plugins/autonomy-team/runtime/cli.mjs` | 제한된 프로젝트 운영·읽기 전용 진단 |
| `plugins/autonomy-team/reference/learning-management.md` | 업무 중 교훈·역할 관리 절차 |
| `docs/AUTONOMY.md` | 승인·정확한 요청 필드·한도·복구 |
| `docs/AUTOMATIC_OPERATION.md` | 직접 끌 때까지 유지하는 자동 운영 설정 |
| `docs/AGENT_MANAGEMENT.md` | 목록·검색·추천 근거·보호·켜기/끄기·보관·복구 |
| `docs/CAPACITY_GOVERNANCE.md` | 용량 알림·중요 항목 보호·승인된 조치 |
| `docs/CROSS_PROJECT_OPERATION.md` | 프로젝트 간 절차 공유·개인정보 검수 |
| `docs/LEGAL_AND_DISTRIBUTION.md` | 상세 권리·배포 점검 |
| `scripts/validate.mjs` | 전체 구조와 보안 규칙 검증 |
| `plugins/autonomy-team/runtime/role-review.mjs` | 역할 파일 읽기·내용 해시 검수 |
| `plugins/autonomy-team/runtime/recovery.mjs` | 실패 보존·후속 해결 사건·증거 연결 |
| `test/*.mjs` | 정상·실패·경계·CI 조건 테스트 |

---

<a id="section-12"></a>

## 12. 문제·오류 대처

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

---

<a id="section-13"></a>

## 13. FAQ — 자주 묻는 질문

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

### Q11. 오류가 한 번 나면 그 업무는 계속 실패로 남나요?

원래 실패 기록은 남습니다. 최신 정본은 같은 요청의 후속 성공 작업과 검수한 파일을 연결해 해결 확인을 할 수 있습니다. 미해결 오류가 있으면 성공 완료로 처리하지 않습니다. 다른 요청의 성공이나 단순한 “고쳤다”는 문장은 해결 증거가 아닙니다.

### Q12. 이번 문서를 읽으면 최신 기능이 설치되나요?

아닙니다. 정본 문서 갱신, 설치 파일 갱신, 실행 중 MCP 재연결은 서로 다릅니다. 정본의 새 명령이 기존 연결에 보이지 않으면 설치본을 확인하고 진행 중인 작업을 저장한 뒤 재연결합니다. 이번 문서 작성은 설치·설정 변경을 하지 않습니다.

---

<a id="section-14"></a>

## 14. 보안·데이터 흐름

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

`web-app-team`과 `research-team`은 외부 Context7 MCP를 선언합니다. `autonomy-team/.mcp.json`은 번들 로컬 sodam-output 실행기를 선언합니다.

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
- 경로 이탈, 잘못된 타입, 이름 불일치, MCP 경로 이탈, 잘못된 UTF-8, 잘못된 MCP 구조 등 8개 악성 사례의 차단 테스트

---

<a id="section-15"></a>

## 15. 폴더 구조·아키텍처

```text
SoDam-Agent-Codex/
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json       # 12개 플러그인의 단일 등록 목록
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
│  ├─ autonomy-team/             # Local hooks, MCP, runtime and learning
│  └─ sodam-agent/
│     ├─ plugin.json            # 현재 매니페스트
│     ├─ .codex-plugin/
│     │  └─ plugin.json         # 호환 매니페스트
│     ├─ .mcp.json              # 해당 플러그인에 필요할 때만 존재
│     └─ skills/<skill>/SKILL.md
├─ docs/                        # 상세 운영·권리·프로젝트 간 공유 안내
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

---

<a id="section-16"></a>

## 16. 개발·테스트·배포 방법

프로젝트 최상위 폴더에서 실행합니다.

```powershell
cd "C:\path\to\SoDam-Agent-Codex"
npm run validate
npm test
```

현재 `npm test`는 아래 26개 스크립트를 순서대로 실행하고, 하나가 실패하면 뒤의 검사를 중단합니다. 정상·예외·경계값·파일 저장·권한·MCP·훅·교훈·역할 생명주기 회귀를 검사합니다. 실제 모델 업무의 효과를 증명하는 시험은 아닙니다.

1. `node test/e2e.mjs`
2. `node test/adversarial.mjs`
3. `node test/runtime.mjs`
4. `node test/ci.mjs`
5. `node test/autonomy.mjs`
6. `node test/bridge.mjs`
7. `node test/documentation.mjs`
8. `node test/release.mjs`
9. `node test/maintenance.mjs`
10. `node test/mcp.mjs`
11. `node test/syntax-checker.mjs`
12. `node test/workflow.mjs`
13. `node test/work-learning.mjs`
14. `node test/archive.mjs`
15. `node test/continuation.mjs`
16. `node test/diagnostics.mjs`
17. `node test/areas.mjs`
18. `node test/workspace-binding.mjs`
19. `node test/cross-project.mjs`
20. `node test/automatic.mjs`
21. `node test/status-display.mjs`
22. `node test/retention.mjs`
23. `node test/capacity-governance.mjs`
24. `node test/agent-management.mjs`
25. `node test/agent-catalog.mjs`
26. `node test/recovery.mjs`

추가 검증:

```powershell
node test/role-review-layout.mjs
npm pack --dry-run --json
```

설치 경로 시험은 현재 `npm test`의 26개 묶음 밖에 있습니다. 임시 폴더에서 단일 버전 탐색과 여러 버전이 있을 때 안전한 거부를 검사합니다. `npm pack --dry-run`은 배포 예정 파일 목록 검사이며 게시하거나 설치하지 않습니다.

기대 기준:

- 플러그인 12개
- 스킬 56개
- 매니페스트 24개
- 런타임 의존성 0개

이 프로젝트에는 별도 애플리케이션 소스의 lint, TypeScript type check, build 명령이 없습니다. 그것들을 실행하지 않은 것을 통과로 해석하면 안 됩니다. 이 저장소의 배포 산출물은 플러그인·스킬·문서이며, 검증은 그 구조와 정책을 대상으로 합니다.

---

<a id="section-17"></a>

## 17. 업데이트·기여 방법

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

---

<a id="section-18"></a>

## 18. 법률·저작권·라이선스·상업적 사용

2026-10-12 재점검: LICENSE 공식 본문 일치·외부 Context7 4.1.1 MIT 표기를 확인했습니다. 정본에는 Git 메타데이터가 없어 브랜치·추적·이력은 미확인입니다. npm 배포 후보의 검사 문서 4개에 있던 PC 절대 경로는 공개 점검에서 비식별화했고 원본은 로컬 백업에 보존했습니다. 파일별 원권리·AI 생성물·전이 의존성·고객 계약은 법무/전문가 검토 필요입니다. 대상 목록과 납품 순서는 [권리·배포 가이드](docs/LEGAL_AND_DISTRIBUTION.md)에 정리했습니다.

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

---

<a id="section-19"></a>

## 19. 현재 한계·미확인

**배포 전 파일 확인:** `.gitignore`는 모든 ZIP이나 npm 패키지에서 자동 제외를 보장하지 않습니다. `npm pack --dry-run --json`은 포함 예정 파일을 보여주는 검사이며 실제 배포가 아닙니다. `.sodam-agent/`, 개인 설정, `.env`, 키·인증서, 작업 로그, 백업, 테스트 결과와 고객 자료를 배포 묶음에서 제외하고 실제 파일 목록을 확인합니다. `package.json`의 `private: true`는 npm 게시를 막는 설정이므로 `npm publish`를 설치 방법으로 사용하지 않습니다.

**라이선스 근거:** [Apache 공식 현재 라이선스 안내](https://www.apache.org/licenses/)와 [Apache License, Version 2.0 본문](https://www.apache.org/licenses/LICENSE-2.0)을 기준으로 합니다. 영어 본문이 공식 기준입니다. 프로젝트 라이선스가 외부 서비스·입력 자료·AI 결과물의 권리를 함께 보장하지는 않습니다. 상업적 사용·수정·재배포 조건은 18장과 `LICENSE`, `NOTICE`를 함께 확인하세요.

다음 항목은 문서 작성 시점에 확인하지 않았거나 이 프로젝트의 범위가 아닙니다.

- 과거 2026-09-23 당시 이 PC의 마켓플레이스 등록과 11개 플러그인 설치·활성화: **확인됨** (2026-09-23, Codex CLI 0.155.1). 다른 PC·계정은 **미확인**
- 설치 후 모든 팀이 모든 새 프로젝트에서 적절히 자동 선택되는지: **전체 조합 미확인**. 설치·활성화만으로 매 요청의 자동 선택을 보장하지 않습니다.
- Context7 MCP 초기화 협상과 실제 문서 질의: **미실행**
- `actionlint` 별도 검사: 도구가 없어 **미실행**
- 서비스용 웹·모바일 화면·로그인·권한 API·SQL 데이터베이스 CRUD: 해당 기능이 없어 **대상 아님**. 로컬 JSON 저장·권한·오류 처리는 런타임 시험 대상입니다.
- README HTML 화면·브라우저 콘솔: 문서 검증 대상입니다. 문서 화면 확인을 실제 서비스 화면이나 모든 기기 검증으로 해석하지 않습니다.
- macOS·Linux 실기기 설치와 경로 호환성: **미확인**

정적·로컬 테스트 통과는 실제 사용자 설치와 외부 서비스 통신 성공을 대신하지 않습니다. 실제 운영 전에 별도 테스트용 Codex 환경에서 설치→목록 확인→팀별 대표 요청→제거→재설치 흐름을 확인하는 것이 안전합니다.

---

<a id="section-20"></a>

## 20. 원본·출처

- 원본 프로젝트: [sodam-ai/SoDam-Agent](https://github.com/sodam-ai/SoDam-Agent)
- Codex 포팅 저장소: [sodam-ai/SoDam-Agent-Codex](https://github.com/sodam-ai/SoDam-Agent-Codex)
- 포팅 기준 원본 커밋: `34866df`
- 저작권: Copyright 2026 SoDam AI Studio
- 라이선스: Apache License 2.0 — 상세 조건은 `LICENSE`와 `NOTICE` 참조

문서의 명령은 현재 로컬 Codex CLI 도움말, 프로젝트의 `package.json`, 매니페스트, 테스트, CI 설정을 기준으로 작성했습니다. 설치 전에는 사용 중인 Codex 버전의 `codex plugin --help`를 함께 확인하십시오.

---

