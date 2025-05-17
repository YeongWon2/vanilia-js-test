// src/index.js
import './styles/memo.css';
import './styles/filter.css';
import * as DB from './indexedDB';
import * as Filter from './filter';
import * as Postit from './postit';

// 앱 초기화
async function initApp() {
  console.log('앱 초기화 중...');

  try {
    // IndexedDB 초기화
    await DB.initDatabase();
    console.log('데이터베이스 연결 성공');

    // 포스트잇 모듈 초기화
    Postit.init();
    console.log('포스트잇 모듈 초기화 완료');

    // 필터 및 생성 버튼 초기화
    await Filter.init();
    console.log('필터 버튼 초기화 완료');
  } catch (error) {
    console.error('앱 초기화 실패:', error);
  }
}

// 페이지 로드 시 앱 초기화
document.addEventListener('DOMContentLoaded', initApp);
