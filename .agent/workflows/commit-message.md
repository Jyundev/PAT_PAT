---
description: Git Commit & PR Execution Rules
---

# antigravity · Git Commit & PR Execution Rules

## 실행 플로우 (고정)

### 0) 컨텍스트 수집 (반드시 수행)

- `git status --porcelain`
- `git diff --name-only --cached`
- `git diff --cached`
- `git diff --name-only`
- `git diff`

---

## 출력 형식 (반드시 아래 템플릿 그대로)

### 1단계: 커밋 메시지 제안 출력

```text
[{Prefix}] {Message}

- {세부내용 1}
- {세부내용 2}

커밋 및 푸시 하시겠습니까? (Y/N)
```

- 세부내용이 없더라도 하이픈 목록을 생략하지 않는다.
- 세부내용은 최소 1개 이상 반드시 포함한다.

---

### 2단계: 사용자가 Y 응답 시 (commit + push)

현재 브랜치를 확인한다:

```
git branch --show-current
```

Windows 환경(특히 PowerShell)에서 한글 인코딩 안정성을 위해 아래 명령을 사용한다.  
커밋 메시지는 반드시 **1단계에서 제안한 그대로** 사용한다.

```bash
$env:LANG='ko_KR.UTF-8'; $env:LC_ALL='ko_KR.UTF-8'; git -c core.quotepath=false commit -m "[{Prefix}] {Message}

- {세부내용 1}
- {세부내용 2}"
git push origin {현재 브랜치}
```

```text
PR 하시겠습니까? (Y/N)

Target: renewal/develop-phase4
```

---

### 3단계: 사용자가 Y 응답 시 (PR 생성)

gh CLI 인증 상태를 확인한다:

```
gh auth status
```

인증되어 있으면 PR을 생성한다:

```bash
gh pr create --fill --base renewal/develop-phase4
```

인증되어 있지 않으면 브라우저로 PR 생성 페이지를 연다.

- 가능한 경우 `gh pr create` 실행 시도 후 안내되는 URL을 연다.
- 또는 원격 저장소 URL 기준으로 PR 생성 페이지를 연다.

---

## 금지 사항

- 규칙, 설명, 메타 코멘트를 추가로 출력하지 않는다.
- 출력 형식 템플릿을 변경하지 않는다.
- 추가 질문을 하지 않는다. (오직 Y/N 질문만 허용)

---

## commit-rules 준수 (필수)

- 모든 커밋 메시지는 **commit-rules를 반드시 따른다.**
- Prefix 선택, 메시지 톤, 문장 구성은 commit-rules를 기준으로 판단한다.
- commit-rules와 본 문서의 규칙이 충돌할 경우,
  **본 문서(antigravity 규칙)를 우선 적용한다.**
- commit-rules를 벗어난 메시지는 제안 단계에서 수정하여 다시 제안한다.
