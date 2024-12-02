declare module 'pulltorefreshjs' {
    interface PullToRefreshOptions {
        distThreshold?: number; // 얼마나 끌어야 새로 고침 동작을 실행할지 (기본값: 60)
        distMax?: number; // 최대 끌 수 있는 거리 (기본값: 80)
        distReload?: number; // 새로 고침 동작 이후 반환되는 거리 (기본값: 50)
        bodyOffset?: number; // 동작 시작을 위한 바디의 스크롤 위치 (기본값: 20)
        resistanceFunction?: (t: number) => number; // 끌림 저항 계산 함수
        triggerElement?: HTMLElement | string; // 이벤트를 감지할 DOM 요소
        instructionsPullToRefresh?: string; // 새로 고침을 위한 안내 메시지
        instructionsReleaseToRefresh?: string; // 새로 고침 동작을 시작할 때의 안내 메시지
        instructionsRefreshing?: string; // 새로 고침 중에 보여줄 메시지
        refreshTimeout?: number; // 새로 고침 동작의 타임아웃
        onRefresh?: () => Promise<void> | void; // 새로 고침 시 실행될 콜백
    }

    export function init(options: PullToRefreshOptions): void;
    export function destroy(): void;
}

