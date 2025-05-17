/**
 * IndexedDB 추상화 모듈
 * 데이터베이스 관련 로직만 처리
 */

// 데이터베이스 이름과 버전
const DB_NAME = 'PostitDB';
const DB_VERSION = 1;

// 데이터베이스 연결 객체
let db = null;

/**
 * IndexedDB 초기화 함수
 * @returns {Promise} 데이터베이스 초기화 Promise
 */
export function initDatabase() {
  return new Promise((resolve, reject) => {
    // 데이터베이스 열기
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 에러 처리
    request.onerror = (event) => {
      console.error('IndexedDB 초기화 에러:', event.target.error);
      reject(event.target.error);
    };

    // 데이터베이스 업그레이드가 필요할 때 (첫 실행 또는 버전 변경 시)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 'postits' 오브젝트 스토어가 없으면 생성
      if (!db.objectStoreNames.contains('postits')) {
        const store = db.createObjectStore('postits', { keyPath: 'id' });

        // 인덱스 생성
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('color', 'color', { unique: false });

        console.log('포스트잇 스토어가 생성되었습니다.');
      }
    };

    // 성공 처리
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('IndexedDB 연결 성공');

      // 데이터베이스 연결 종료 이벤트 처리
      db.onclose = () => {
        console.log('IndexedDB 연결이 닫혔습니다.');
        db = null;
      };

      // 데이터베이스 연결 에러 처리
      db.onerror = (event) => {
        console.error('IndexedDB 에러:', event.target.error);
      };

      resolve(db);
    };
  });
}

/**
 * 모든 포스트잇 가져오기
 * @returns {Promise<Array>} 모든 포스트잇 배열
 */
export function getAllPostits() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('데이터베이스가 초기화되지 않았습니다.'));
      return;
    }

    const transaction = db.transaction(['postits'], 'readonly');
    const store = transaction.objectStore('postits');
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * 포스트잇 저장 또는 업데이트
 * @param {Object} postit 저장할 포스트잇 객체
 * @returns {Promise<Object>} 저장된 포스트잇 객체
 */
export function savePostit(postit) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('데이터베이스가 초기화되지 않았습니다.'));
      return;
    }

    const transaction = db.transaction(['postits'], 'readwrite');
    const store = transaction.objectStore('postits');
    const request = store.put(postit);

    request.onsuccess = () => {
      console.log('포스트잇 저장 성공:', postit.id);
      resolve(postit);
    };

    request.onerror = (event) => {
      console.error('포스트잇 저장 실패:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * 포스트잇 삭제
 * @param {string} id 삭제할 포스트잇 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export function deletePostit(id) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('데이터베이스가 초기화되지 않았습니다.'));
      return;
    }

    const transaction = db.transaction(['postits'], 'readwrite');
    const store = transaction.objectStore('postits');
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('포스트잇 삭제 성공:', id);
      resolve(true);
    };

    request.onerror = (event) => {
      console.error('포스트잇 삭제 실패:', event.target.error);
      reject(event.target.error);
    };
  });
}
