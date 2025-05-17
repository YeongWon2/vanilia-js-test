/**
 * 필터 관련 기능을 담당하는 모듈
 */

import * as DB from './indexedDB';
import { renderPostit } from './postit';

/**
 * 포스트잇 카운터
 * @type {number}
 */
let postItCounter = 0;

/**
 * 색상 필터 상태를 추적하는 전역 변수
 */
let currentFilterColor = null;

/**
 * 필터 버튼 이벤트 핸들러 초기화
 */
function initFilterButtons() {
  // 생성 버튼 이벤트 리스너 등록
  const createButton = document.querySelector('.filter_button:nth-child(3)');
  if (createButton) {
    createButton.addEventListener('click', handleCreatePostit);
    console.log('생성 버튼 이벤트 리스너 등록 완료');
  } else {
    console.warn('생성 버튼을 찾을 수 없습니다.');
  }

  // 생성순 정렬 버튼 이벤트 등록
  const sortButton = document.querySelector('.filter_button:first-child');
  if (sortButton) {
    sortButton.addEventListener('click', handleSortByCreation);
    console.log('생성순 정렬 버튼 이벤트 리스너 등록 완료');
  } else {
    console.warn('생성순 정렬 버튼을 찾을 수 없습니다.');
  }

  // 색상 필터 버튼 이벤트 등록
  const colorFilterButton = document.querySelector('.filter_button.arrow_down');
  if (colorFilterButton) {
    // 색상 필터 드롭다운 생성
    createColorFilterDropdown();

    // 버튼 클릭 이벤트
    colorFilterButton.addEventListener('click', () => {
      const dropdown = document.querySelector('.color_filter_dropdown');

      // 드롭다운 토글
      if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        colorFilterButton.classList.remove('arrow_up');
        colorFilterButton.classList.add('arrow_down');
      } else {
        dropdown.style.display = 'block';
        colorFilterButton.classList.remove('arrow_down');
        colorFilterButton.classList.add('arrow_up');
      }
    });

    console.log('색상 필터 버튼 이벤트 리스너 등록 완료');
  } else {
    console.warn('색상 필터 버튼을 찾을 수 없습니다.');
  }

  // 드롭다운 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    const colorFilterButton = document.querySelector('.filter_button.arrow_down, .filter_button.arrow_up');
    const dropdown = document.querySelector('.color_filter_dropdown');

    if (dropdown && !dropdown.contains(e.target) && colorFilterButton && !colorFilterButton.contains(e.target)) {
      dropdown.style.display = 'none';
      colorFilterButton.classList.remove('arrow_up');
      colorFilterButton.classList.add('arrow_down');
    }
  });
}

/**
 * 색상 필터 드롭다운 생성
 */
function createColorFilterDropdown() {
  // 사용 가능한 색상 정의 - 투명도 0.8로 통일
  const colors = [
    { name: '노랑', color: 'rgba(255, 235, 59, 0.8)' },
    { name: '초록', color: 'rgba(205, 220, 57, 0.8)' },
    { name: '파랑', color: 'rgba(144, 202, 249, 0.8)' },
    { name: '분홍', color: 'rgba(248, 187, 208, 0.8)' },
    { name: '보라', color: 'rgba(206, 147, 216, 0.8)' },
  ];

  // 드롭다운 컨테이너 생성
  const dropdown = document.createElement('div');
  dropdown.className = 'color_filter_dropdown';

  // 색상 항목 추가
  colors.forEach((color) => {
    const item = document.createElement('div');
    item.className = 'color_filter_item';
    item.setAttribute('data-color', color.color);

    const preview = document.createElement('div');
    preview.className = 'color_filter_preview';
    preview.style.backgroundColor = color.color;

    const name = document.createElement('div');
    name.className = 'color_filter_name';
    name.textContent = color.name;

    item.appendChild(preview);
    item.appendChild(name);
    dropdown.appendChild(item);

    // 색상 항목 클릭 이벤트 처리 내부
    item.addEventListener('click', () => {
      // 현재 선택된 색상 확인
      const colorFilterButton = document.querySelector('.filter_button.arrow_down, .filter_button.arrow_up');
      const prevColor = currentFilterColor;

      // 같은 색상 다시 클릭하면 필터 해제
      if (prevColor === color.color) {
        currentFilterColor = null;
        window.currentFilterColor = null;

        if (colorFilterButton) {
          colorFilterButton.classList.remove('color_filter_active');
          colorFilterButton.removeAttribute('data-filter-color');

          // 모든 색상 클래스 제거
          colorFilterButton.classList.remove('color-yellow', 'color-green', 'color-blue', 'color-pink', 'color-purple');
        }

        // 모든 포스트잇 표시
        showAllPostits();
      } else {
        // 다른 색상 선택 - 필터 적용
        currentFilterColor = color.color;
        window.currentFilterColor = color.color;

        if (colorFilterButton) {
          // 모든 색상 클래스 제거 후 필요한 클래스 추가
          colorFilterButton.classList.remove('color-yellow', 'color-green', 'color-blue', 'color-pink', 'color-purple');

          // 색상에 따라 적절한 클래스 추가
          if (color.color === 'rgba(255, 235, 59, 0.8)') {
            colorFilterButton.classList.add('color-yellow');
          } else if (color.color === 'rgba(205, 220, 57, 0.8)') {
            colorFilterButton.classList.add('color-green');
          } else if (color.color === 'rgba(144, 202, 249, 0.8)') {
            colorFilterButton.classList.add('color-blue');
          } else if (color.color === 'rgba(248, 187, 208, 0.8)') {
            colorFilterButton.classList.add('color-pink');
          } else if (color.color === 'rgba(206, 147, 216, 0.8)') {
            colorFilterButton.classList.add('color-purple');
          }

          colorFilterButton.classList.add('color_filter_active');
          colorFilterButton.setAttribute('data-filter-color', color.color);
        }

        // 선택한 색상으로 필터링
        filterPostitsByColor(color.color);
      }

      // 드롭다운 닫기
      dropdown.style.display = 'none';

      if (colorFilterButton) {
        colorFilterButton.classList.remove('arrow_up');
        colorFilterButton.classList.add('arrow_down');
      }
    });
  });

  // 문서에 드롭다운 추가
  const filterSection = document.querySelector('#filter');
  filterSection.appendChild(dropdown);
}

/**
 * 색상에 따라 포스트잇 필터링
 * @param {string} color 필터링할 색상
 */
function filterPostitsByColor(color) {
  // 현재 필터 색상 업데이트
  currentFilterColor = color;
  window.currentFilterColor = color;

  // 모든 포스트잇 요소 가져오기
  const postitElements = document.querySelectorAll('.memo');

  if (postitElements.length === 0) {
    console.log('필터링할 포스트잇이 없습니다.');
    return;
  }

  console.log(`색상 필터 적용: ${color}`);

  // 각 포스트잇에 대해 필터 적용
  postitElements.forEach((element) => {
    // 색상 값 확인
    const elementColor = element.style.backgroundColor;
    const dataColor = element.getAttribute('data-color');

    // 선택한 색상과 일치하는지 확인
    if (color === elementColor || color === dataColor) {
      // 일치하면 표시
      element.style.display = 'flex';
    } else {
      // 일치하지 않으면 숨기기
      element.style.display = 'none';
    }
  });
}

/**
 * 모든 포스트잇 표시
 */
function showAllPostits() {
  // 현재 필터 색상 초기화
  currentFilterColor = null;
  window.currentFilterColor = null;

  // 모든 포스트잇 요소 가져오기
  const postitElements = document.querySelectorAll('.memo');

  // 모든 포스트잇 표시
  postitElements.forEach((element) => {
    element.style.display = 'flex';
  });

  console.log('모든 포스트잇 표시');
}

/**
 * 생성 버튼 클릭 이벤트 핸들러
 */
async function handleCreatePostit() {
  try {
    // 기존 포스트잇 가져오기
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

    // 현재 날짜 포맷팅 (YYYY.MM.DD)
    const today = new Date();
    const formattedDate = formatDate(today);

    // 새 포스트잇의 위치 계산
    const position = calculateNewPosition(allPostits);

    // 새 포스트잇 객체 생성
    const postitId = `postit-${newIndex}`;
    const postit = {
      id: postitId,
      title: `메모 ${newIndex} - ${formattedDate}`,
      content: '',
      color: 'rgba(255, 235, 59, 0.8)', // 기본 색상 (노랑 / 0.8)
      createdAt: today.getTime(),
      width: 300,
      height: 400,
      position: position, // 계산된 위치 적용
    };

    // 포스트잇 저장
    await DB.savePostit(postit);
    console.log('포스트잇 생성 및 저장 성공:', postitId);

    // 화면에 렌더링 (postit.js의 함수 사용)
    renderPostit(postit, 0, true); // 인덱스는 중요하지 않음

    // 생성 후 카운터 업데이트 (가장 큰 인덱스 + 1)
    postItCounter = Math.max(...usedNumbers, newIndex);
  } catch (error) {
    console.error('포스트잇 생성 중 오류 발생:', error);
  }
}

/**
 * 새 포스트잇의 위치 계산
 * @param {Array} existingPostits 기존 포스트잇 목록
 * @returns {Object} x, y 좌표 객체
 */
function calculateNewPosition(existingPostits) {
  const MEMO_WIDTH = 300;
  const MEMO_HEIGHT = 400;
  const MARGIN = 30;
  const CONTAINER_PADDING = 20;

  const filterSection = document.querySelector('#filter');
  const filterHeight = filterSection ? filterSection.offsetHeight + filterSection.offsetTop + 20 : 60;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let newX = CONTAINER_PADDING;
  let newY = filterHeight;

  if (existingPostits && existingPostits.length > 0) {
    const sortedPostits = [...existingPostits].sort((a, b) => b.createdAt - a.createdAt);
    const lastPostit = sortedPostits[0];

    if (lastPostit && lastPostit.position) {
      newX = lastPostit.position.x + MEMO_WIDTH + MARGIN;
      newY = lastPostit.position.y;

      // 오른쪽 끝을 넘으면 다음 줄로 이동
      if (newX + MEMO_WIDTH + CONTAINER_PADDING > viewportWidth) {
        newX = CONTAINER_PADDING;
        newY = lastPostit.position.y + MEMO_HEIGHT + MARGIN;
      }

      // 아래쪽 공간이 부족하면 겹쳐도 생성
      if (newY + MEMO_HEIGHT + CONTAINER_PADDING > viewportHeight) {
        console.warn('공간이 부족하여 포스트잇이 겹칠 수 있습니다.');
        return {
          x: CONTAINER_PADDING,
          y: filterHeight,
        };
      }

      // 필터 영역 위로는 가지 않도록 보정
      if (newY < filterHeight) {
        newY = filterHeight;
      }
    }
  }

  return { x: newX, y: newY };
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
 * 생성순 정렬 버튼 클릭 이벤트 핸들러
 */
async function handleSortByCreation() {
  try {
    // 모든 포스트잇 가져오기
    const allPostits = await DB.getAllPostits();

    if (!allPostits || allPostits.length === 0) {
      console.log('정렬할 포스트잇이 없습니다.');
      return;
    }

    // 색상 필터가 적용된 경우 해당 색상만 필터링
    const colorFilter = window.currentFilterColor;
    const filteredPostits = colorFilter ? allPostits.filter((p) => p.color === colorFilter) : allPostits;

    if (filteredPostits.length === 0) {
      console.log('필터된 색상에 해당하는 포스트잇이 없습니다.');
      return;
    }

    // 생성일 기준으로 정렬 (오름차순: 생성순)
    const sortedPostits = [...filteredPostits].sort((a, b) => {
      // 생성일이 없으면 createdAt으로 비교
      if (!a.createdAt || !b.createdAt) {
        return a.createdAt - b.createdAt;
      }
      return a.createdAt - b.createdAt;
    });

    // 정렬 후 위치 재배치
    await rearrangePostits(sortedPostits);

    console.log('생성순 정렬 완료');
  } catch (error) {
    console.error('생성순 정렬 중 오류 발생:', error);
  }
}

/**
 * 포스트잇 재배치
 * @param {Array} postits 재배치할 포스트잇 목록
 */
async function rearrangePostits(postits) {
  const MARGIN = 30;
  const CONTAINER_PADDING = 20;

  // 필터 영역의 높이 계산
  const filterSection = document.querySelector('#filter');
  const filterHeight = filterSection ? filterSection.offsetHeight + filterSection.offsetTop + 20 : 60;

  // 컨테이너 너비 계산
  const container = document.querySelector('#app');
  const containerWidth = container.clientWidth - CONTAINER_PADDING * 2;

  // 각 행의 현재 위치를 추적
  let currentRowY = filterHeight;
  let currentRowMaxHeight = 0;
  let currentX = CONTAINER_PADDING;

  // 각 포스트잇 위치 계산 및 업데이트
  for (let i = 0; i < postits.length; i++) {
    const postit = postits[i];

    // 포스트잇의 실제 너비와 높이 사용 (기본값 제공)
    const width = postit.width || 300;
    const height = postit.height || 400;

    // 현재 행에 더 이상 공간이 없으면 새 행으로 이동
    if (currentX + width + CONTAINER_PADDING > containerWidth) {
      currentX = CONTAINER_PADDING; // X 좌표 초기화
      currentRowY += currentRowMaxHeight + MARGIN; // Y 좌표 다음 행으로 이동
      currentRowMaxHeight = 0; // 새 행의 최대 높이 초기화
    }

    // 새 위치 계산
    const newX = currentX;
    const newY = currentRowY;

    // 포스트잇 위치 업데이트
    postit.position = { x: newX, y: newY };

    // DB에 업데이트
    await DB.savePostit(postit);

    // DOM 요소 위치 업데이트
    const memoElement = document.getElementById(postit.id);
    if (memoElement) {
      memoElement.style.left = `${newX}px`;
      memoElement.style.top = `${newY}px`;

      // 애니메이션 효과 추가 (부드러운 이동)
      memoElement.style.transition = 'left 0.3s, top 0.3s';

      // 트랜지션 후 제거 (나중에 드래그할 때 영향 없도록)
      setTimeout(() => {
        memoElement.style.transition = '';
      }, 300);
    }

    // 다음 포스트잇의 X 위치 갱신
    currentX += width + MARGIN;

    // 현재 행의 최대 높이 갱신
    currentRowMaxHeight = Math.max(currentRowMaxHeight, height);
  }
}

/**
 * 카운터 초기화
 */
async function initCounter() {
  try {
    // 모든 포스트잇 가져오기
    const postits = await DB.getAllPostits();

    // 포스트잇 ID 중 가장 큰 번호 찾기
    if (postits && postits.length > 0) {
      const numbers = postits.map((postit) => {
        // null이나 undefined 체크 추가
        if (!postit || typeof postit.id !== 'string') {
          return 0;
        }
        const match = postit.id.match(/postit-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      postItCounter = Math.max(...numbers);
    } else {
      // 포스트잇이 없으면 카운터를 0으로 설정
      postItCounter = 0;
    }

    console.log('포스트잇 카운터 초기화:', postItCounter);
  } catch (error) {
    console.error('카운터 초기화 실패:', error);
    // 오류 발생 시 기본값으로 설정
    postItCounter = 0;
  }
}

/**
 * 모듈 초기화
 */
async function init() {
  await initCounter();
  initFilterButtons();
}

// 모듈 내보내기
export { init };
