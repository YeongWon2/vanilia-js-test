import * as DB from './indexedDB';

/**
 * 포스트잇 관련 기능을 담당하는 모듈
 */

// 인라인 배치를 위한 변수
const MEMO_WIDTH = 300; // 포스트잇 너비
const MEMO_HEIGHT = 400; // 포스트잇 높이
const MARGIN = 15; // 포스트잇 간격
const CONTAINER_PADDING = 20; // 컨테이너 패딩

/**
 * 포스트잇의 초기 위치 계산 (인라인 블록 형태로)
 * @param {number} index 포스트잇 인덱스
 * @returns {Object} x, y 좌표 객체
 */
function calculateInitialPosition(index) {
  // 앱 컨테이너의 너비
  const container = document.querySelector('#app');
  const containerWidth = container.clientWidth - CONTAINER_PADDING * 2;

  // 한 줄에 배치 가능한 포스트잇 수
  const itemsPerRow = Math.floor(containerWidth / (MEMO_WIDTH + MARGIN * 2));

  // 현재 행과 열 계산
  const row = Math.floor(index / itemsPerRow);
  const col = index % itemsPerRow;

  // 위치 계산
  const x = CONTAINER_PADDING + col * (MEMO_WIDTH + MARGIN * 2) + MARGIN;
  const y = CONTAINER_PADDING + row * (MEMO_HEIGHT + MARGIN * 2) + MARGIN;

  return { x, y };
}

/**
 * 포스트잇을 화면에 렌더링
 * @param {Object} postit 포스트잇 객체
 * @param {number} index 포스트잇 인덱스
 * @param {boolean} isNewPostit 새로 생성된 포스트잇인지 여부
 */
function renderPostit(postit, index, isNewPostit = false) {
  // 메모 컨테이너 생성
  const memoContainer = document.createElement('div');
  memoContainer.className = 'memo';
  memoContainer.id = postit.id;
  memoContainer.style.backgroundColor = postit.color;

  // data-color 속성 추가
  memoContainer.setAttribute('data-color', postit.color);

  // 위치 설정 (절대 위치)
  memoContainer.style.position = 'absolute';

  // 저장된 크기가 있으면 적용, 없으면 기본 크기 사용
  memoContainer.style.width = `${postit.width || MEMO_WIDTH}px`;
  memoContainer.style.height = `${postit.height || MEMO_HEIGHT}px`;

  // 위치 설정: 저장된 위치가 있으면 사용, 없으면 인라인 배치
  if (postit.position) {
    memoContainer.style.left = `${postit.position.x}px`;
    memoContainer.style.top = `${postit.position.y}px`;
  } else {
    // 초기 인라인 블록 형태의 위치 계산
    const position = calculateInitialPosition(index);
    memoContainer.style.left = `${position.x}px`;
    memoContainer.style.top = `${position.y}px`;

    // 위치 정보 저장
    postit.position = position;

    // DB에 업데이트
    DB.savePostit(postit).catch((error) => {
      console.error('포스트잇 초기 위치 저장 실패:', error);
    });
  }

  // 펼치기/접기 아이콘 (기본값: 펼침)
  const toggleIcon = postit.collapsed ? '▼' : '▲';

  // 메모 HTML 구성
  memoContainer.innerHTML = `
        <div class="memo_header">
          <button class="memo_toggle" aria-label="메모 펼치기/접기">
            <span class="memo_toggle_icon">${toggleIcon}</span>
          </button>
          <div class="memo_title">${postit.title}</div>
          <button class="memo_menu" aria-label="메모 메뉴">
            <div class="memo_menu_dot"></div>
            <div class="memo_menu_dot"></div>
            <div class="memo_menu_dot"></div>
          </button>
          <ul class="memo_dropdown">
            <li class="memo_dropdown_item memo_edit_item">수정</li>
            <li class="memo_dropdown_item memo_color_item">색상변경</li>
            <li class="memo_dropdown_item memo_duplicate_item">복제</li>
            <li class="memo_dropdown_item memo_delete_item">삭제</li>
          </ul>
        </div>
        <div class="memo_content" style="${postit.collapsed ? 'display: none;' : ''}">
          <textarea class="memo_textarea" placeholder="내용을 입력하세요">${postit.content || ''}</textarea>
          <div class="memo_counter_container">
            <div class="memo_counter">(${(postit.content || '').length}/1000)</div>
          </div>
        </div>
        <!-- 색상 모달 -->
        <div class="memo_dim"></div>
        <div class="color_modal">
          <div class="color_modal_header">
            <div class="color_modal_title">색상 선택</div>
            <button class="color_modal_close">X</button>
          </div>
          <div class="color_list">
            <div class="color_item" data-color="rgba(255, 235, 59, 0.8)">
              <div class="color_preview" style="background-color: rgba(255, 235, 59, 0.8);"></div>
              <div class="color_name">노랑</div>
            </div>
            <div class="color_item" data-color="rgba(205, 220, 57, 0.8)">
              <div class="color_preview" style="background-color: rgba(205, 220, 57, 0.8);"></div>
              <div class="color_name">초록</div>
            </div>
            <div class="color_item" data-color="rgba(144, 202, 249, 0.8)">
              <div class="color_preview" style="background-color: rgba(144, 202, 249, 0.8);"></div>
              <div class="color_name">파랑</div>
            </div>
            <div class="color_item" data-color="rgba(248, 187, 208, 0.8)">
              <div class="color_preview" style="background-color: rgba(248, 187, 208, 0.8);"></div>
              <div class="color_name">분홍</div>
            </div>
            <div class="color_item" data-color="rgba(206, 147, 216, 0.8)">
              <div class="color_preview" style="background-color: rgba(206, 147, 216, 0.8);"></div>
              <div class="color_name">보라</div>
            </div>
          </div>
        </div>
    `;

  // 접힌 상태면 클래스 추가
  if (postit.collapsed) {
    memoContainer.classList.add('collapsed');
  }

  // 문서에 메모 추가
  const appContainer = document.querySelector('#app');
  appContainer.appendChild(memoContainer);

  // Z-Index 설정: 새 메모는 가장 상위로
  if (isNewPostit) {
    // DB에서 최대 zIndex 값 찾기
    DB.getAllPostits()
      .then((postits) => {
        let maxZIndex = 0;
        postits.forEach((p) => {
          if (p.id !== postit.id && p.zIndex && p.zIndex > maxZIndex) {
            maxZIndex = p.zIndex;
          }
        });

        // 새 메모는 가장 큰 zIndex + 1로 설정
        const newZIndex = maxZIndex + 1;
        memoContainer.style.zIndex = newZIndex.toString();

        // postit 객체에 zIndex 저장
        postit.zIndex = newZIndex;

        // DB에 zIndex 값 저장
        DB.savePostit(postit).catch((error) => {
          console.error('포스트잇 zIndex 저장 실패:', error);
        });
      })
      .catch((error) => {
        console.error('zIndex 최대값 조회 실패:', error);
        // 오류 시 기본값 사용
        memoContainer.style.zIndex = '1000';
        postit.zIndex = 1000;
      });

    // 새 메모에 자동 포커스
    const textarea = memoContainer.querySelector('.memo_textarea');
    setTimeout(() => textarea.focus(), 100);
  } else {
    // 기존 메모는 저장된 zIndex 사용 또는 기본값 적용
    const zIndex = postit.zIndex || index + 100; // 기본값으로 인덱스 + 100 사용
    memoContainer.style.zIndex = zIndex.toString();
  }

  // 드래그 기능 추가
  setupDragAndDrop(memoContainer, postit);

  // 크기 조절 기능 추가
  setupResize(memoContainer, postit);

  // 메뉴 기능 추가
  setupMenu(memoContainer, postit);

  // 텍스트 에어리어 기능 추가
  setupTextarea(memoContainer, postit);

  // 펼치기/접기 기능 추가
  setupToggle(memoContainer, postit);

  // 현재 필터 적용 체크 (글로벌 변수 체크)
  if (window.currentFilterColor && window.currentFilterColor !== postit.color) {
    memoContainer.style.display = 'none';
  }

  console.log('포스트잇 렌더링 완료:', postit.id);
}

/**
 * 드롭다운 메뉴 위치 조정
 * @param {HTMLElement} dropdown 드롭다운 요소
 * @param {HTMLElement} parentElement 포스트잇 요소
 */
function adjustDropdownPosition(dropdown, parentElement) {
  // 메뉴 버튼 위치 가져오기
  const menuButton = parentElement.querySelector('.memo_menu');
  const menuRect = menuButton.getBoundingClientRect();

  // 임시로 스타일 초기화 (위치 계산을 위해)
  dropdown.style.removeProperty('left');
  dropdown.style.removeProperty('right');
  dropdown.style.removeProperty('top');
  dropdown.style.removeProperty('bottom');

  // 드롭다운 위치를 메뉴 버튼 기준으로 설정
  // 메뉴 버튼 오른쪽에 표시 (기본 위치)
  dropdown.style.position = 'absolute';
  dropdown.style.top = '0';
  dropdown.style.left = '100%'; // 메뉴 버튼의 오른쪽에 위치
  dropdown.style.marginLeft = '5px'; // 간격 추가

  // 화면 경계 확인을 위한 요소들의 위치와 크기 계산
  const dropdownRect = dropdown.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 오른쪽 경계 체크
  if (dropdownRect.right > viewportWidth) {
    // 오른쪽으로 표시할 공간이 부족하면 왼쪽에 표시
    dropdown.style.removeProperty('left');
    dropdown.style.right = '100%';
    dropdown.style.marginLeft = '0';
    dropdown.style.marginRight = '5px';
  }

  // 아래쪽 경계 체크
  if (dropdownRect.bottom > viewportHeight) {
    // 드롭다운이 아래로 넘치면 위치 조정
    const topOffset = Math.max(0, viewportHeight - dropdownRect.height);
    dropdown.style.top = `${topOffset - menuRect.top}px`;
  }
}

/**
 * 포스트잇 텍스트 에어리어 기능 설정
 * @param {HTMLElement} element 포스트잇 요소
 * @param {Object} postit 포스트잇 데이터
 */
function setupTextarea(element, postit) {
  const textarea = element.querySelector('.memo_textarea');
  const counter = element.querySelector('.memo_counter');

  // 메모 내용 변경 여부를 추적하는 플래그
  let contentChanged = false;
  let originalContent = postit.content || '';

  // 텍스트 변경 시 글자 수 업데이트 및 제한
  textarea.addEventListener('input', () => {
    const content = textarea.value;
    const length = content.length;

    // 글자 수 카운터 업데이트
    counter.textContent = `(${length}/1000)`;

    // 1000자 제한
    if (length > 1000) {
      textarea.value = content.substring(0, 1000);
      counter.textContent = '(1000/1000)';
    }

    // 내용 변경 플래그 설정
    contentChanged = true;
  });

  // 포커스를 잃었을 때나 ESC 키 눌렀을 때만 저장
  function saveContent() {
    if (contentChanged) {
      postit.content = textarea.value;
      DB.savePostit(postit)
        .then(() => {
          console.log('포스트잇 내용 저장 성공:', postit.id);
          contentChanged = false;
          originalContent = textarea.value;
        })
        .catch((error) => {
          console.error('포스트잇 내용 저장 실패:', error);
          // 저장 실패 시 원래 내용으로 복원
          textarea.value = originalContent;
          counter.textContent = `(${originalContent.length}/1000)`;
        });
    }
  }

  // 포커스 해제 시 저장
  textarea.addEventListener('blur', saveContent);

  // ESC 키 눌렀을 때 포커스 해제 및 저장
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // IME 입력 중인 상태를 확인
      if (e.isComposing || e.keyCode === 229) {
        // IME 입력 중이면 이벤트를 처리하지 않음
        return;
      }

      // 입력 중인 문자열 확정 후 블러 처리
      setTimeout(() => {
        textarea.blur(); // blur 이벤트가 발생하면 위의 blur 핸들러에서 저장
      }, 10);

      e.preventDefault(); // 기본 동작 방지
    }
  });

  // 포스트잇 외부 클릭 시 포커스 해제 (이미 blur 이벤트에서 저장됨)
  document.addEventListener('click', (e) => {
    if (!element.contains(e.target)) {
      textarea.blur();
    }
  });
}

/**
 * 포스트잇 메뉴 기능 설정
 * @param {HTMLElement} element 포스트잇 요소
 * @param {Object} postit 포스트잇 데이터
 */
function setupMenu(element, postit) {
  const menuButton = element.querySelector('.memo_menu');
  const dropdown = element.querySelector('.memo_dropdown');
  const editButton = element.querySelector('.memo_edit_item');
  const colorButton = element.querySelector('.memo_color_item');
  const duplicateButton = element.querySelector('.memo_duplicate_item');
  const deleteButton = element.querySelector('.memo_delete_item');
  const textarea = element.querySelector('.memo_textarea');

  // 색상 모달 관련 요소
  const dim = element.querySelector('.memo_dim');
  const colorModal = element.querySelector('.color_modal');
  const closeButton = element.querySelector('.color_modal_close');
  const colorItems = element.querySelectorAll('.color_item');

  // 메뉴 버튼 클릭 시 드롭다운 표시 및 위치 조정
  menuButton.addEventListener('click', (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지

    // 드롭다운 표시 전 위치 재설정을 위해 먼저 active 클래스 추가
    dropdown.classList.add('active');

    // 드롭다운 위치 조정
    adjustDropdownPosition(dropdown, element);

    // 이미 active 상태일 때 클릭하면 닫기
    if (dropdown.dataset.isOpen === 'true') {
      dropdown.classList.remove('active');
      dropdown.dataset.isOpen = 'false';
    } else {
      dropdown.dataset.isOpen = 'true';
    }
  });

  // 다른 곳 클릭 시 드롭다운 숨기기
  document.addEventListener('click', () => {
    dropdown.classList.remove('active');
    dropdown.dataset.isOpen = 'false';
  });

  // 드롭다운 내부 클릭 시 이벤트 버블링 방지
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // 수정 버튼 클릭 시 텍스트 에어리어에 포커스
  editButton.addEventListener('click', () => {
    dropdown.classList.remove('active');
    dropdown.dataset.isOpen = 'false';

    // 포스트잇이 접혀있으면 펼치기
    if (element.classList.contains('collapsed')) {
      const toggleButton = element.querySelector('.memo_toggle');
      toggleButton.click();
    }

    textarea.focus();
  });

  // 복제 버튼 클릭 시 포스트잇 복제
  duplicateButton.addEventListener('click', async () => {
    try {
      // 모든 포스트잇 가져오기
      const allPostits = await DB.getAllPostits();

      // 사용 중인 ID 숫자 목록 생성
      const usedNumbers = allPostits
        .map((postit) => {
          const match = postit.id.match(/postit-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => a - b); // 오름차순 정렬

      // 빈 인덱스 찾기 (1부터 시작)
      let newIndex = 1;
      for (const num of usedNumbers) {
        if (num > newIndex) {
          // 빈 자리 발견
          break;
        }
        newIndex = num + 1;
      }

      // 현재 날짜 포맷팅 (YYYY.MM.DD) - 복제일
      const today = new Date();
      const formattedDate = formatDate(today);

      // 새 포스트잇 객체 생성 (복제)
      const postitId = `postit-${newIndex}`;
      const duplicatedPostit = {
        id: postitId,
        title: `메모 ${newIndex} - ${formattedDate}`,
        content: postit.content || '', // 내용 복제
        color: postit.color, // 색상 복제
        createdAt: today.getTime(), // 복제 시간으로 설정
        width: postit.width,
        height: postit.height,
        collapsed: false, // 복제 시 항상 펼쳐진 상태로
        // 위치는 약간 오른쪽 아래로 이동
        position: {
          x: postit.position.x + 20,
          y: postit.position.y + 20,
        },
      };

      // 포스트잇 저장
      await DB.savePostit(duplicatedPostit);
      console.log('포스트잇 복제 및 저장 성공:', postitId);

      // 화면에 렌더링
      renderPostit(duplicatedPostit, allPostits.length, true); // 새 포스트잇으로 취급

      // 드롭다운 닫기
      dropdown.classList.remove('active');
      dropdown.dataset.isOpen = 'false';
    } catch (error) {
      console.error('포스트잇 복제 중 오류 발생:', error);
    }
  });

  // 삭제 버튼 클릭 시 포스트잇 삭제
  deleteButton.addEventListener('click', async () => {
    try {
      // DB에서 삭제
      await DB.deletePostit(postit.id);

      // DOM에서 제거
      element.remove();

      console.log('포스트잇 삭제 완료:', postit.id);
    } catch (error) {
      console.error('포스트잇 삭제 중 오류 발생:', error);
      alert('메모 삭제 중 오류가 발생했습니다.');
    }
  });

  // 색상 변경 버튼 클릭 시 색상 모달 표시
  colorButton.addEventListener('click', () => {
    // 드롭다운 닫기
    dropdown.classList.remove('active');
    dropdown.dataset.isOpen = 'false';

    // 현재 선택된 색상 표시
    colorItems.forEach((item) => {
      const itemColor = item.getAttribute('data-color');
      if (itemColor === postit.color) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // 딤 처리 및 모달 표시
    dim.style.display = 'block';
    colorModal.style.display = 'block';
  });

  // 색상 항목 클릭 이벤트
  colorItems.forEach((item) => {
    item.addEventListener('click', () => {
      const newColor = item.getAttribute('data-color');
      const oldColor = postit.color; // 이전 색상 저장

      // 선택 표시 업데이트
      colorItems.forEach((i) => i.classList.remove('selected'));
      item.classList.add('selected');

      // 색상 변경 적용
      element.style.backgroundColor = newColor;
      element.setAttribute('data-color', newColor); // data-color 속성도 업데이트
      postit.color = newColor;

      // DB에 저장
      DB.savePostit(postit)
        .then(() => {
          console.log('포스트잇 색상 업데이트 성공:', postit.id);

          // 현재 적용된 색상 필터 확인
          const activeFilter = window.currentFilterColor;

          // 색상 필터가 적용된 상태이고, 변경된 색상이 필터 색상과 다르면 숨김
          if (activeFilter && activeFilter !== newColor) {
            element.style.display = 'none';
          }

          // 모달 닫기
          dim.style.display = 'none';
          colorModal.style.display = 'none';
        })
        .catch((error) => {
          console.error('포스트잇 색상 업데이트 실패:', error);
          // 실패 시 원래 색상으로 복원
          element.style.backgroundColor = oldColor;
          element.setAttribute('data-color', oldColor);
          postit.color = oldColor;
        });
    });
  });

  // 모달 닫기 버튼 클릭 이벤트
  closeButton.addEventListener('click', () => {
    dim.style.display = 'none';
    colorModal.style.display = 'none';
  });
}

/**
 * 펼치기/접기 버튼 기능 설정
 * @param {HTMLElement} element 포스트잇 요소
 * @param {Object} postit 포스트잇 데이터
 */
function setupToggle(element, postit) {
  const toggleButton = element.querySelector('.memo_toggle');
  const toggleIcon = element.querySelector('.memo_toggle_icon');
  const content = element.querySelector('.memo_content');

  toggleButton.addEventListener('click', () => {
    const isCollapsed = element.classList.contains('collapsed');

    if (isCollapsed) {
      // 펼치기
      element.style.height = `${postit.height || 400}px`;
      content.style.display = 'flex';
      toggleIcon.textContent = '▲';
      element.classList.remove('collapsed');
      postit.collapsed = false;
    } else {
      // 접기
      element.style.height = `40px`;
      content.style.display = 'none';
      toggleIcon.textContent = '▼';
      element.classList.add('collapsed');
      postit.collapsed = true;
    }

    // DB에 저장
    DB.savePostit(postit).catch((error) => {
      console.error('포스트잇 상태 저장 실패:', error);
    });
  });
}

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅
 * @param {Date} date 날짜 객체
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 포스트잇에 드래그 앤 드롭 기능 설정
 * @param {HTMLElement} element 포스트잇 요소
 * @param {Object} postit 포스트잇 데이터
 */
function setupDragAndDrop(element, postit) {
  const header = element.querySelector('.memo_header');
  let isDragging = false;
  let startX, startY, initialLeft, initialTop, initialPosition;

  // 필터 영역의 높이 계산
  const filterSection = document.querySelector('#filter');
  const filterHeight = filterSection ? filterSection.offsetHeight + filterSection.offsetTop + 20 : 60;

  // 드래그 시작 이벤트
  header.addEventListener('mousedown', async (e) => {
    // 메뉴 버튼 또는 토글 버튼 클릭 시 드래그 중지
    if (
      e.target.classList.contains('memo_menu') ||
      e.target.classList.contains('memo_menu_dot') ||
      e.target.classList.contains('memo_toggle') ||
      e.target.classList.contains('memo_toggle_icon')
    ) {
      return;
    }

    try {
      // zIndex 업데이트 코드 (기존과 동일)
      const allPostits = await DB.getAllPostits();

      let maxZIndex = 0;
      allPostits.forEach((p) => {
        if (p.id !== postit.id && p.zIndex && p.zIndex > maxZIndex) {
          maxZIndex = p.zIndex;
        }
      });

      const newZIndex = maxZIndex + 1;
      element.style.zIndex = newZIndex.toString();
      postit.zIndex = newZIndex;

      await DB.savePostit(postit);
    } catch (error) {
      console.error('포스트잇 zIndex 업데이트 중 오류 발생:', error);
      element.style.zIndex = '1000';
    }

    // 드래그 시작 시 스크롤 비활성화
    const appContainer = document.querySelector('#app');
    appContainer.style.overflow = 'hidden';

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = parseInt(element.style.left) || 0;
    initialTop = parseInt(element.style.top) || 0;

    // 드래그 시작 위치 기억 (document를 벗어날 경우 복원을 위해)
    initialPosition = { x: initialLeft, y: initialTop };

    // 선택 방지
    e.preventDefault();
  });

  // 드래그 중 이벤트
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    // 왼쪽 경계 체크
    if (newLeft < 0) newLeft = 0;

    // 상단 경계 체크 (필터 UI 영역 아래로만 이동 가능)
    if (newTop < filterHeight) newTop = filterHeight;

    // 위치 적용
    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;

    // 앱 컨테이너 영역을 벗어났는지 체크
    const appContainer = document.querySelector('#app');
    const appRect = appContainer.getBoundingClientRect();
    const memoRect = element.getBoundingClientRect();

    // 앱 컨테이너를 벗어났거나 필터 영역과 겹치는지 확인
    const isOutOfBounds =
      memoRect.right > appRect.right ||
      memoRect.bottom > appRect.bottom ||
      memoRect.left < appRect.left ||
      memoRect.top < appRect.top;

    // 앱 컨테이너를 벗어난 경우 시각적 피드백 (예: 테두리 색상 변경)
    if (isOutOfBounds) {
      element.style.boxShadow = '0 0 10px 2px red';
    } else {
      element.style.boxShadow = '';
    }
  });

  // 드래그 종료 이벤트
  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;

    isDragging = false;

    // 드래그 종료 시 스크롤 복구
    const appContainer = document.querySelector('#app');
    appContainer.style.overflow = 'auto';

    // 현재 화면에 보이는 app 영역 기준으로 판단
    const appRect = appContainer.getBoundingClientRect();
    const memoRect = element.getBoundingClientRect();

    const isOutOfBounds =
      memoRect.left < appRect.left ||
      memoRect.top < appRect.top + filterHeight ||
      memoRect.right > appRect.right ||
      memoRect.bottom > appRect.bottom;

    // 시각적 피드백 초기화
    element.style.boxShadow = '';

    // 앱 컨테이너를 벗어나거나 필터 영역과 겹치면 원래 위치로 복원
    if (isOutOfBounds) {
      element.style.left = `${initialPosition.x}px`;
      element.style.top = `${initialPosition.y}px`;
      console.log('포스트잇이 화면에서 벗어나거나 필터 영역과 겹쳐 원래 위치로 복원됨:', postit.id);
      return;
    }

    const finalLeft = parseInt(element.style.left, 10);
    const finalTop = parseInt(element.style.top, 10);

    // 위치가 변경된 경우만 저장
    if (finalLeft !== initialLeft || finalTop !== initialTop) {
      postit.position = {
        x: finalLeft,
        y: finalTop,
      };

      DB.savePostit(postit)
        .then(() => {
          console.log('포스트잇 위치 업데이트 성공:', postit.id);
        })
        .catch((error) => {
          console.error('포스트잇 위치 업데이트 실패:', error);
        });
    }
  });

  // 클릭 시 맨 앞으로 가져오기
  element.addEventListener('click', async (e) => {
    // 메뉴 버튼 또는 토글 버튼 클릭은 처리하지 않음
    if (
      e.target.classList.contains('memo_menu') ||
      e.target.classList.contains('memo_menu_dot') ||
      e.target.classList.contains('memo_toggle') ||
      e.target.classList.contains('memo_toggle_icon') ||
      e.target.classList.contains('memo_dropdown_item') ||
      e.target.classList.contains('memo_dropdown')
    ) {
      return;
    }

    try {
      // 현재 포스트잇 이외의 모든 포스트잇을 가져옴
      const allPostits = await DB.getAllPostits();

      // 현재 최대 zIndex 값 찾기
      let maxZIndex = 0;
      allPostits.forEach((p) => {
        if (p.id !== postit.id && p.zIndex && p.zIndex > maxZIndex) {
          maxZIndex = p.zIndex;
        }
      });

      // 새로운 zIndex 값은 현재 최대값 + 1
      const newZIndex = maxZIndex + 1;

      // 현재 포스트잇 화면 업데이트
      element.style.zIndex = newZIndex.toString();

      // 현재 포스트잇 객체 업데이트
      postit.zIndex = newZIndex;

      // DB에 현재 포스트잇 zIndex 저장
      await DB.savePostit(postit);

      console.log(`포스트잇 ${postit.id}를 맨 앞으로 가져옴 (zIndex: ${newZIndex})`);
    } catch (error) {
      console.error('포스트잇 zIndex 업데이트 중 오류 발생:', error);
      // 오류 시 기본값 사용
      element.style.zIndex = '1000';
    }
  });
}

/**
 * 포스트잇 크기 조절 기능 설정
 * @param {HTMLElement} element 포스트잇 요소
 * @param {Object} postit 포스트잇 데이터
 */
function setupResize(element, postit) {
  // 크기 조절 핸들 생성
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize_handle';
  resizeHandle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        cursor: nwse-resize;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 0 0 5px 0;
    `;
  element.appendChild(resizeHandle);

  let isResizing = false;
  let startX, startY, startWidth, startHeight;
  let initialWidth, initialHeight; // 처음 크기 기억 (변경 여부 확인용)

  // 리사이즈 시작
  resizeHandle.addEventListener('mousedown', async (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

    // 초기 크기 기억
    initialWidth = startWidth;
    initialHeight = startHeight;

    // 맨 앞으로 가져오기 (zIndex 처리)
    try {
      // 현재 포스트잇 이외의 모든 포스트잇을 가져옴
      const allPostits = await DB.getAllPostits();

      // 현재 최대 zIndex 값 찾기
      let maxZIndex = 0;
      allPostits.forEach((p) => {
        if (p.id !== postit.id && p.zIndex && p.zIndex > maxZIndex) {
          maxZIndex = p.zIndex;
        }
      });

      // 새로운 zIndex 값은 현재 최대값 + 1
      const newZIndex = maxZIndex + 1;

      // 현재 포스트잇 화면 업데이트
      element.style.zIndex = newZIndex.toString();

      // 현재 포스트잇 객체 업데이트
      postit.zIndex = newZIndex;

      // DB에 현재 포스트잇 zIndex 저장
      await DB.savePostit(postit);
    } catch (error) {
      console.error('포스트잇 zIndex 업데이트 중 오류 발생:', error);
      // 오류 시 기본값 사용
      element.style.zIndex = '1000';
    }

    e.preventDefault();
    e.stopPropagation();
  });

  // 리사이즈 중
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const width = startWidth + (e.clientX - startX);
    const height = startHeight + (e.clientY - startY);

    // 최소 크기 제한
    const minWidth = 200;
    const minHeight = 200;

    if (width > minWidth) {
      element.style.width = width + 'px';
      postit.width = width;
    }

    if (height > minHeight) {
      element.style.height = height + 'px';
      postit.height = height;
    }
  });

  // 리사이즈 종료
  document.addEventListener('mouseup', () => {
    if (!isResizing) return;

    isResizing = false;

    // 크기가 변경되었는지 확인
    const currentWidth = parseInt(element.style.width);
    const currentHeight = parseInt(element.style.height);

    // 변경된 경우에만 DB 저장
    if (currentWidth !== initialWidth || currentHeight !== initialHeight) {
      // DB에 크기 변경 저장
      DB.savePostit(postit)
        .then(() => {
          console.log('포스트잇 크기 업데이트 성공:', postit.id, `(${currentWidth}x${currentHeight})`);
        })
        .catch((error) => {
          console.error('포스트잇 크기 업데이트 실패:', error);
          // 실패 시 원래 크기로 복원
          element.style.width = `${initialWidth}px`;
          element.style.height = `${initialHeight}px`;
          postit.width = initialWidth;
          postit.height = initialHeight;
        });
    }
  });
}

/**
 * 저장된 포스트잇 목록 렌더링
 * @param {Array} postits 포스트잇 목록
 */
function renderPostitList(postits) {
  if (!postits || !Array.isArray(postits)) return;

  console.log('포스트잇 목록 렌더링 시작');

  // zIndex 값이 있는 포스트잇은 zIndex 기준 정렬 (낮은 값부터 먼저 렌더링)
  const sortedPostits = [...postits].sort((a, b) => {
    const aZIndex = a.zIndex || 0;
    const bZIndex = b.zIndex || 0;
    return aZIndex - bZIndex;
  });

  // 포스트잇 목록 렌더링
  sortedPostits.forEach((postit, index) => {
    if (postit && typeof postit === 'object') {
      renderPostit(postit, index);
    }
  });

  console.log(`${postits.length}개의 포스트잇 렌더링 완료`);
}

/**
 * 포스트잇 모듈 초기화
 */
async function init() {
  console.log('포스트잇 모듈 초기화');

  try {
    // DB에서 모든 포스트잇 가져오기
    const postits = await DB.getAllPostits();

    // 가져온 포스트잇 목록 렌더링
    renderPostitList(postits);

    console.log('저장된 포스트잇 로드 및 렌더링 완료');
  } catch (error) {
    console.error('포스트잇 초기화 중 오류 발생:', error);
  }
}

// 모듈 내보내기
export { renderPostit, renderPostitList, init };
