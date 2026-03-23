export { API_BASE_URL, apiFetch } from "./client";
export { login, logout, register } from "./authApi";
export {
	getQuizzes,
	getQuizDetail,
	startAttempt,
	submitAttempt,
	checkAttemptQuestion,
	createManualQuiz
} from "./quizApi";
export { getLeaderboard, getDashboard } from "./statsApi";
export {
	getSubjects,
	getMaterialsBySubject,
	createMaterial,
	createBilingualMaterial
} from "./materialsApi";
export { uploadQuestionImage, uploadMaterialFile } from "./mediaApi";
export {
	getAdminUsers,
	createAdminUser,
	updateAdminUser,
	deleteAdminUser,
	lockAdminUser,
	unlockAdminUser,
	getAdminQuizzes,
	updateAdminQuiz,
	deleteAdminQuiz,
	updateAdminMaterial,
	deleteAdminMaterial,
} from "./adminApi";
