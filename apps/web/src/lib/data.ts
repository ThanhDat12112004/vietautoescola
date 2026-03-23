// Sample quiz data matching the MySQL schema
export const sampleQuizCategories = [
  {
    id: 1,
    name_vi: "Biển báo giao thông",
    name_es: "Señales de tráfico",
    slug: "bien-bao-giao-thong",
    description_vi: "Câu hỏi biển báo và tình huống giao thông cơ bản",
    description_es: "Preguntas sobre señales y situaciones básicas de tráfico",
  },
  {
    id: 2,
    name_vi: "Luật giao thông đường bộ",
    name_es: "Ley de tráfico vial",
    slug: "luat-giao-thong",
    description_vi: "Các quy định pháp luật về giao thông đường bộ",
    description_es: "Normativas legales de tráfico vial",
  },
  {
    id: 3,
    name_vi: "Kỹ thuật lái xe",
    name_es: "Técnicas de conducción",
    slug: "ky-thuat-lai-xe",
    description_vi: "Kỹ năng và kỹ thuật lái xe an toàn",
    description_es: "Habilidades y técnicas de conducción segura",
  },
];

export const sampleQuizzes = [
  {
    id: 1,
    category_id: 1,
    code: "QUIZ-000001",
    title_vi: "Đề thi mô phỏng DGT - 001",
    title_es: "Examen por Ordenador - 001",
    description_vi: "Đề mô phỏng 30 câu cho thi bằng lái tại Tây Ban Nha",
    description_es: "Examen simulado de 30 preguntas para el examen DGT",
    duration_minutes: 30,
    total_questions: 10,
    passing_score: 5.0,
  },
  {
    id: 2,
    category_id: 2,
    code: "QUIZ-000002",
    title_vi: "Quy tắc ưu tiên giao thông",
    title_es: "Reglas de prioridad en tráfico",
    description_vi: "Kiểm tra kiến thức về quyền ưu tiên khi tham gia giao thông",
    description_es: "Evaluación de conocimientos sobre prioridades de tráfico",
    duration_minutes: 20,
    total_questions: 8,
    passing_score: 5.0,
  },
  {
    id: 3,
    category_id: 3,
    code: "QUIZ-000003",
    title_vi: "Kỹ thuật phanh và xử lý",
    title_es: "Técnicas de frenado y manejo",
    description_vi: "Bài kiểm tra về kỹ thuật phanh và xử lý tình huống khẩn cấp",
    description_es: "Test sobre técnicas de frenado y manejo de emergencias",
    duration_minutes: 15,
    total_questions: 8,
    passing_score: 5.0,
  },
];

export type QuestionType = {
  id: number;
  quiz_id: number;
  order_number: number;
  points: number;
  question_text_vi: string;
  question_text_es: string;
  explanation_vi: string;
  explanation_es: string;
  image_url?: string | null;
  answers: { id: number; order_number: number; is_correct: boolean; answer_text_vi: string; answer_text_es: string; }[];
};

export const sampleQuestions: QuestionType[] = [
  // Quiz 1 - 10 questions
  {
    id: 1, quiz_id: 1, order_number: 1, points: 1,
    question_text_vi: "Trong khu dân cư, biển nào báo hiệu tốc độ tối đa 30 km/h?",
    question_text_es: "En zona urbana, ¿qué señal indica velocidad máxima de 30 km/h?",
    explanation_vi: "Biển tròn viền đỏ có số 30 là giới hạn tốc độ tối đa 30 km/h.",
    explanation_es: "La señal circular con borde rojo y número 30 indica velocidad máxima de 30 km/h.",
    answers: [
      { id: 1, order_number: 1, is_correct: true, answer_text_vi: "Biển tròn viền đỏ ghi số 30", answer_text_es: "Señal circular con borde rojo y número 30" },
      { id: 2, order_number: 2, is_correct: false, answer_text_vi: "Biển tam giác cảnh báo nguy hiểm", answer_text_es: "Señal triangular de peligro" },
      { id: 3, order_number: 3, is_correct: false, answer_text_vi: "Biển tròn nền xanh hướng dẫn", answer_text_es: "Señal circular azul de obligación" },
    ],
  },
  {
    id: 2, quiz_id: 1, order_number: 2, points: 1,
    question_text_vi: "Khi vào đường cao tốc, bạn cần làm gì?",
    question_text_es: "Al incorporarte a una autopista, ¿qué debes hacer?",
    explanation_vi: "Cần tăng tốc ở làn tăng tốc và nhường đường cho xe đang đi trên cao tốc.",
    explanation_es: "Debes acelerar por el carril de incorporación y ceder el paso al tráfico de la autopista.",
    answers: [
      { id: 4, order_number: 1, is_correct: true, answer_text_vi: "Tăng tốc trên làn tăng tốc và quan sát để nhập an toàn", answer_text_es: "Acelerar en el carril de incorporación y entrar con seguridad" },
      { id: 5, order_number: 2, is_correct: false, answer_text_vi: "Dừng hẳn ở đầu đường cao tốc và chờ trống", answer_text_es: "Parar en el inicio de la autopista para esperar hueco" },
      { id: 6, order_number: 3, is_correct: false, answer_text_vi: "Đi chậm trên làn khẩn cấp", answer_text_es: "Circular despacio por el arcén" },
    ],
  },
  {
    id: 3, quiz_id: 1, order_number: 3, points: 1,
    question_text_vi: "Có được phép sử dụng điện thoại di động khi đang lái xe không?",
    question_text_es: "¿Puede utilizar el teléfono móvil en algún momento de la conducción?",
    explanation_vi: "Không được phép sử dụng điện thoại cầm tay khi lái xe, trừ khi có thiết bị rảnh tay.",
    explanation_es: "No está permitido usar el móvil en la mano, excepto con dispositivo manos libres.",
    answers: [
      { id: 7, order_number: 1, is_correct: false, answer_text_vi: "Có, ví dụ khi dừng đèn đỏ", answer_text_es: "Sí, por ejemplo detenido en un semáforo" },
      { id: 8, order_number: 2, is_correct: false, answer_text_vi: "Có, nhưng chỉ trong khu vực đô thị tốc độ thấp", answer_text_es: "Sí, pero solo en vías urbanas a poca velocidad" },
      { id: 9, order_number: 3, is_correct: true, answer_text_vi: "Không, khi không có thiết bị rảnh tay", answer_text_es: "No, cuando no dispone de un dispositivo manos libres" },
    ],
  },
  {
    id: 4, quiz_id: 1, order_number: 4, points: 1,
    question_text_vi: "Khoảng cách an toàn tối thiểu khi đi theo xe phía trước trên đường cao tốc là bao nhiêu giây?",
    question_text_es: "¿Cuál es la distancia mínima de seguridad al seguir al vehículo de delante en autopista?",
    explanation_vi: "Quy tắc 2 giây: luôn giữ khoảng cách ít nhất 2 giây so với xe phía trước.",
    explanation_es: "Regla de 2 segundos: siempre mantener al menos 2 segundos de distancia con el vehículo de delante.",
    answers: [
      { id: 10, order_number: 1, is_correct: true, answer_text_vi: "Ít nhất 2 giây", answer_text_es: "Al menos 2 segundos" },
      { id: 11, order_number: 2, is_correct: false, answer_text_vi: "1 giây là đủ", answer_text_es: "1 segundo es suficiente" },
      { id: 12, order_number: 3, is_correct: false, answer_text_vi: "Không có quy định cụ thể", answer_text_es: "No hay norma específica" },
    ],
  },
  {
    id: 5, quiz_id: 1, order_number: 5, points: 1,
    question_text_vi: "Khi nào bắt buộc phải bật đèn chiếu gần (đèn cốt)?",
    question_text_es: "¿Cuándo es obligatorio encender las luces de cruce?",
    explanation_vi: "Đèn chiếu gần bắt buộc từ khi trời tối, trong đường hầm, và khi tầm nhìn bị hạn chế.",
    explanation_es: "Las luces de cruce son obligatorias desde el anochecer, en túneles y cuando la visibilidad es reducida.",
    answers: [
      { id: 13, order_number: 1, is_correct: true, answer_text_vi: "Khi trời tối, trong đường hầm và khi tầm nhìn hạn chế", answer_text_es: "De noche, en túneles y con visibilidad reducida" },
      { id: 14, order_number: 2, is_correct: false, answer_text_vi: "Chỉ khi trời tối hoàn toàn", answer_text_es: "Solo cuando es completamente de noche" },
      { id: 15, order_number: 3, is_correct: false, answer_text_vi: "Không bắt buộc, chỉ khuyến khích", answer_text_es: "No es obligatorio, solo recomendable" },
    ],
  },
  {
    id: 6, quiz_id: 1, order_number: 6, points: 1,
    question_text_vi: "Tốc độ tối đa cho phép trên đường cao tốc tại Tây Ban Nha là bao nhiêu?",
    question_text_es: "¿Cuál es la velocidad máxima permitida en autopista en España?",
    explanation_vi: "Tốc độ tối đa trên đường cao tốc tại Tây Ban Nha là 120 km/h cho xe du lịch.",
    explanation_es: "La velocidad máxima en autopista en España es de 120 km/h para turismos.",
    answers: [
      { id: 16, order_number: 1, is_correct: false, answer_text_vi: "100 km/h", answer_text_es: "100 km/h" },
      { id: 17, order_number: 2, is_correct: true, answer_text_vi: "120 km/h", answer_text_es: "120 km/h" },
      { id: 18, order_number: 3, is_correct: false, answer_text_vi: "130 km/h", answer_text_es: "130 km/h" },
    ],
  },
  {
    id: 7, quiz_id: 1, order_number: 7, points: 1,
    question_text_vi: "Biển hình tam giác viền đỏ có ý nghĩa gì?",
    question_text_es: "¿Qué significa una señal triangular con borde rojo?",
    explanation_vi: "Biển hình tam giác viền đỏ là biển cảnh báo nguy hiểm, báo cho tài xế biết có nguy hiểm phía trước.",
    explanation_es: "La señal triangular con borde rojo es de advertencia de peligro, avisa de un peligro próximo.",
    answers: [
      { id: 19, order_number: 1, is_correct: true, answer_text_vi: "Cảnh báo nguy hiểm phía trước", answer_text_es: "Advertencia de peligro próximo" },
      { id: 20, order_number: 2, is_correct: false, answer_text_vi: "Bắt buộc phải dừng xe", answer_text_es: "Obligación de detenerse" },
      { id: 21, order_number: 3, is_correct: false, answer_text_vi: "Cấm đi vào", answer_text_es: "Prohibido el paso" },
    ],
  },
  {
    id: 8, quiz_id: 1, order_number: 8, points: 1,
    question_text_vi: "Nồng độ cồn tối đa cho phép đối với tài xế mới (ít hơn 2 năm kinh nghiệm) là bao nhiêu?",
    question_text_es: "¿Cuál es la tasa máxima de alcohol permitida para conductores noveles (menos de 2 años)?",
    explanation_vi: "Tài xế mới (dưới 2 năm) có giới hạn 0.15 mg/l trong hơi thở hoặc 0.3 g/l trong máu.",
    explanation_es: "Los conductores noveles tienen un límite de 0,15 mg/l en aire espirado o 0,3 g/l en sangre.",
    answers: [
      { id: 22, order_number: 1, is_correct: true, answer_text_vi: "0.15 mg/l trong hơi thở", answer_text_es: "0,15 mg/l en aire espirado" },
      { id: 23, order_number: 2, is_correct: false, answer_text_vi: "0.25 mg/l trong hơi thở", answer_text_es: "0,25 mg/l en aire espirado" },
      { id: 24, order_number: 3, is_correct: false, answer_text_vi: "0.50 mg/l trong hơi thở", answer_text_es: "0,50 mg/l en aire espirado" },
    ],
  },
  {
    id: 9, quiz_id: 1, order_number: 9, points: 1,
    question_text_vi: "Khi gặp xe cứu thương đang bật còi và đèn ưu tiên, bạn phải làm gì?",
    question_text_es: "Cuando un vehículo de emergencia se acerca con sirena y luces, ¿qué debe hacer?",
    explanation_vi: "Phải nhường đường ngay lập tức cho xe ưu tiên bằng cách tấp vào lề phải.",
    explanation_es: "Debe ceder el paso inmediatamente apartándose hacia la derecha.",
    answers: [
      { id: 25, order_number: 1, is_correct: true, answer_text_vi: "Tấp vào lề phải và nhường đường ngay", answer_text_es: "Apartarse a la derecha y ceder el paso" },
      { id: 26, order_number: 2, is_correct: false, answer_text_vi: "Tăng tốc để không cản trở", answer_text_es: "Acelerar para no estorbar" },
      { id: 27, order_number: 3, is_correct: false, answer_text_vi: "Dừng xe ngay tại chỗ", answer_text_es: "Detenerse en el sitio" },
    ],
  },
  {
    id: 10, quiz_id: 1, order_number: 10, points: 1,
    question_text_vi: "Tại ngã tư không có biển báo hay đèn tín hiệu, xe nào được ưu tiên?",
    question_text_es: "En una intersección sin señales ni semáforos, ¿quién tiene prioridad?",
    explanation_vi: "Tại ngã tư không có biển báo, xe đến từ bên phải được ưu tiên (quy tắc ưu tiên bên phải).",
    explanation_es: "En intersecciones sin señalización, tiene prioridad el vehículo que viene por la derecha.",
    answers: [
      { id: 28, order_number: 1, is_correct: true, answer_text_vi: "Xe đến từ bên phải", answer_text_es: "El vehículo que viene por la derecha" },
      { id: 29, order_number: 2, is_correct: false, answer_text_vi: "Xe đến từ bên trái", answer_text_es: "El vehículo que viene por la izquierda" },
      { id: 30, order_number: 3, is_correct: false, answer_text_vi: "Xe nào đến trước được ưu tiên", answer_text_es: "El que llegue primero tiene prioridad" },
    ],
  },

  // Quiz 2 - 8 questions
  {
    id: 11, quiz_id: 2, order_number: 1, points: 1,
    question_text_vi: "Tại vòng xuyến, xe nào được ưu tiên?",
    question_text_es: "En una rotonda, ¿quién tiene prioridad?",
    explanation_vi: "Xe đang lưu thông trong vòng xuyến luôn được ưu tiên.",
    explanation_es: "Los vehículos que ya circulan dentro de la rotonda tienen prioridad.",
    answers: [
      { id: 31, order_number: 1, is_correct: true, answer_text_vi: "Xe đang đi trong vòng xuyến", answer_text_es: "Los que ya circulan dentro de la rotonda" },
      { id: 32, order_number: 2, is_correct: false, answer_text_vi: "Xe muốn vào vòng xuyến", answer_text_es: "Los que quieren entrar a la rotonda" },
      { id: 33, order_number: 3, is_correct: false, answer_text_vi: "Xe lớn hơn", answer_text_es: "El vehículo más grande" },
    ],
  },
  {
    id: 12, quiz_id: 2, order_number: 2, points: 1,
    question_text_vi: "Khi có cảnh sát giao thông điều khiển, tín hiệu nào được ưu tiên?",
    question_text_es: "Cuando un agente dirige el tráfico, ¿qué señal prevalece?",
    explanation_vi: "Tín hiệu của cảnh sát giao thông luôn được ưu tiên cao nhất.",
    explanation_es: "Las indicaciones del agente siempre prevalecen sobre cualquier otra señal.",
    answers: [
      { id: 34, order_number: 1, is_correct: true, answer_text_vi: "Tín hiệu của cảnh sát giao thông", answer_text_es: "Las indicaciones del agente" },
      { id: 35, order_number: 2, is_correct: false, answer_text_vi: "Đèn giao thông", answer_text_es: "Los semáforos" },
      { id: 36, order_number: 3, is_correct: false, answer_text_vi: "Biển báo đường bộ", answer_text_es: "Las señales de tráfico" },
    ],
  },
  {
    id: 13, quiz_id: 2, order_number: 3, points: 1,
    question_text_vi: "Xe cứu hỏa đang làm nhiệm vụ có được vượt đèn đỏ không?",
    question_text_es: "¿Puede un camión de bomberos en servicio pasar un semáforo en rojo?",
    explanation_vi: "Xe ưu tiên khi đang làm nhiệm vụ được phép vượt đèn đỏ nhưng phải đảm bảo an toàn.",
    explanation_es: "Los vehículos prioritarios en servicio pueden pasar semáforos en rojo, pero con precaución.",
    answers: [
      { id: 37, order_number: 1, is_correct: true, answer_text_vi: "Có, nhưng phải đảm bảo an toàn", answer_text_es: "Sí, pero con precaución" },
      { id: 38, order_number: 2, is_correct: false, answer_text_vi: "Không, trong mọi trường hợp", answer_text_es: "No, en ningún caso" },
      { id: 39, order_number: 3, is_correct: false, answer_text_vi: "Chỉ khi không có xe khác", answer_text_es: "Solo si no hay otros vehículos" },
    ],
  },
  {
    id: 14, quiz_id: 2, order_number: 4, points: 1,
    question_text_vi: "Người đi bộ có quyền ưu tiên khi nào?",
    question_text_es: "¿Cuándo tienen prioridad los peatones?",
    explanation_vi: "Người đi bộ được ưu tiên tại vạch sang đường khi họ đã bước vào hoặc chuẩn bị qua đường.",
    explanation_es: "Los peatones tienen prioridad en los pasos de peatones cuando ya han iniciado o están a punto de cruzar.",
    answers: [
      { id: 40, order_number: 1, is_correct: true, answer_text_vi: "Tại vạch sang đường khi đã bước vào hoặc chuẩn bị qua", answer_text_es: "En pasos de peatones cuando han iniciado o están a punto de cruzar" },
      { id: 41, order_number: 2, is_correct: false, answer_text_vi: "Mọi lúc mọi nơi", answer_text_es: "En todo momento y lugar" },
      { id: 42, order_number: 3, is_correct: false, answer_text_vi: "Chỉ khi có đèn xanh cho người đi bộ", answer_text_es: "Solo con semáforo verde para peatones" },
    ],
  },
  {
    id: 15, quiz_id: 2, order_number: 5, points: 1,
    question_text_vi: "Trên đường một chiều có hai làn, bạn muốn rẽ trái. Bạn phải đi ở làn nào?",
    question_text_es: "En una vía de un solo sentido con dos carriles, quiere girar a la izquierda. ¿En qué carril debe situarse?",
    explanation_vi: "Khi rẽ trái trên đường một chiều, phải đi ở làn bên trái.",
    explanation_es: "Para girar a la izquierda en una vía de un solo sentido, debe situarse en el carril izquierdo.",
    answers: [
      { id: 43, order_number: 1, is_correct: true, answer_text_vi: "Làn bên trái", answer_text_es: "El carril izquierdo" },
      { id: 44, order_number: 2, is_correct: false, answer_text_vi: "Làn bên phải", answer_text_es: "El carril derecho" },
      { id: 45, order_number: 3, is_correct: false, answer_text_vi: "Làn nào cũng được", answer_text_es: "Cualquier carril" },
    ],
  },
  {
    id: 16, quiz_id: 2, order_number: 6, points: 1,
    question_text_vi: "Đèn vàng nhấp nháy có nghĩa là gì?",
    question_text_es: "¿Qué significa una luz amarilla intermitente?",
    explanation_vi: "Đèn vàng nhấp nháy nghĩa là cần đi chậm và cẩn thận, chú ý quan sát.",
    explanation_es: "La luz amarilla intermitente indica precaución, debe reducir la velocidad y extremar la atención.",
    answers: [
      { id: 46, order_number: 1, is_correct: true, answer_text_vi: "Đi chậm và cẩn thận", answer_text_es: "Precaución, reducir velocidad" },
      { id: 47, order_number: 2, is_correct: false, answer_text_vi: "Phải dừng xe", answer_text_es: "Debe detenerse" },
      { id: 48, order_number: 3, is_correct: false, answer_text_vi: "Được phép đi nhanh", answer_text_es: "Puede circular rápido" },
    ],
  },
  {
    id: 17, quiz_id: 2, order_number: 7, points: 1,
    question_text_vi: "Khi vượt xe phía trước, bạn phải vượt từ bên nào?",
    question_text_es: "Al adelantar al vehículo de delante, ¿por qué lado debe hacerlo?",
    explanation_vi: "Luôn phải vượt từ bên trái, trừ trường hợp đặc biệt.",
    explanation_es: "Siempre se debe adelantar por la izquierda, salvo excepciones.",
    answers: [
      { id: 49, order_number: 1, is_correct: true, answer_text_vi: "Bên trái", answer_text_es: "Por la izquierda" },
      { id: 50, order_number: 2, is_correct: false, answer_text_vi: "Bên phải", answer_text_es: "Por la derecha" },
      { id: 51, order_number: 3, is_correct: false, answer_text_vi: "Bên nào cũng được", answer_text_es: "Por cualquier lado" },
    ],
  },
  {
    id: 18, quiz_id: 2, order_number: 8, points: 1,
    question_text_vi: "Xe buýt đang dừng đón khách tại trạm, bạn có được vượt không?",
    question_text_es: "Un autobús está parado en la parada recogiendo viajeros, ¿puede adelantarlo?",
    explanation_vi: "Có thể vượt xe buýt đang dừng tại trạm nếu đảm bảo an toàn và không vi phạm vạch kẻ đường.",
    explanation_es: "Puede adelantar al autobús parado si lo hace con seguridad y sin invadir líneas continuas.",
    answers: [
      { id: 52, order_number: 1, is_correct: true, answer_text_vi: "Có, nếu đảm bảo an toàn", answer_text_es: "Sí, si se hace con seguridad" },
      { id: 53, order_number: 2, is_correct: false, answer_text_vi: "Không, phải chờ xe buýt đi", answer_text_es: "No, debe esperar a que el autobús arranque" },
      { id: 54, order_number: 3, is_correct: false, answer_text_vi: "Chỉ được vượt từ bên phải", answer_text_es: "Solo puede adelantar por la derecha" },
    ],
  },

  // Quiz 3 - 8 questions
  {
    id: 19, quiz_id: 3, order_number: 1, points: 1,
    question_text_vi: "Khi phanh gấp trên đường ướt, bạn nên làm gì?",
    question_text_es: "Al frenar bruscamente en carretera mojada, ¿qué debe hacer?",
    explanation_vi: "Trên đường ướt, phanh nhẹ nhàng và liên tục, tránh phanh gấp để không bị trượt.",
    explanation_es: "En carretera mojada, frene suavemente y de forma progresiva para evitar derrapar.",
    answers: [
      { id: 55, order_number: 1, is_correct: true, answer_text_vi: "Phanh nhẹ nhàng, từ từ tăng lực phanh", answer_text_es: "Frenar suavemente, aumentando la presión progresivamente" },
      { id: 56, order_number: 2, is_correct: false, answer_text_vi: "Đạp phanh thật mạnh ngay lập tức", answer_text_es: "Pisar el freno con toda la fuerza inmediatamente" },
      { id: 57, order_number: 3, is_correct: false, answer_text_vi: "Chỉ dùng phanh tay", answer_text_es: "Usar solo el freno de mano" },
    ],
  },
  {
    id: 20, quiz_id: 3, order_number: 2, points: 1,
    question_text_vi: "Hệ thống ABS giúp gì khi phanh?",
    question_text_es: "¿Para qué sirve el sistema ABS al frenar?",
    explanation_vi: "ABS ngăn bánh xe bị khóa cứng khi phanh, giúp tài xế vẫn điều khiển được hướng lái.",
    explanation_es: "El ABS evita el bloqueo de las ruedas al frenar, permitiendo mantener el control de la dirección.",
    answers: [
      { id: 58, order_number: 1, is_correct: true, answer_text_vi: "Ngăn bánh xe bị khóa cứng, giữ khả năng lái", answer_text_es: "Evita el bloqueo de ruedas, mantiene la dirección" },
      { id: 59, order_number: 2, is_correct: false, answer_text_vi: "Giảm quãng đường phanh trên mọi mặt đường", answer_text_es: "Reduce la distancia de frenado en todas las superficies" },
      { id: 60, order_number: 3, is_correct: false, answer_text_vi: "Tự động phanh khi gặp chướng ngại vật", answer_text_es: "Frena automáticamente ante obstáculos" },
    ],
  },
  {
    id: 21, quiz_id: 3, order_number: 3, points: 1,
    question_text_vi: "Khi xe bị mất lái (trượt ngang), bạn phải làm gì?",
    question_text_es: "Cuando el vehículo derrapa, ¿qué debe hacer?",
    explanation_vi: "Khi xe trượt, phải đánh lái theo hướng xe trượt và giảm ga từ từ.",
    explanation_es: "Al derrapar, debe girar el volante en la dirección del derrape y soltar el acelerador progresivamente.",
    answers: [
      { id: 61, order_number: 1, is_correct: true, answer_text_vi: "Đánh lái theo hướng trượt và giảm ga", answer_text_es: "Girar en la dirección del derrape y soltar acelerador" },
      { id: 62, order_number: 2, is_correct: false, answer_text_vi: "Đánh lái ngược hướng trượt và phanh gấp", answer_text_es: "Girar en dirección contraria y frenar bruscamente" },
      { id: 63, order_number: 3, is_correct: false, answer_text_vi: "Tăng ga để thoát khỏi trượt", answer_text_es: "Acelerar para salir del derrape" },
    ],
  },
  {
    id: 22, quiz_id: 3, order_number: 4, points: 1,
    question_text_vi: "Áp suất lốp quá thấp sẽ gây ra hậu quả gì?",
    question_text_es: "¿Qué consecuencia tiene una presión de neumáticos demasiado baja?",
    explanation_vi: "Áp suất lốp thấp làm tăng tiêu hao nhiên liệu, giảm độ bám đường và tăng nguy cơ nổ lốp.",
    explanation_es: "La presión baja aumenta el consumo, reduce el agarre y aumenta el riesgo de reventón.",
    answers: [
      { id: 64, order_number: 1, is_correct: true, answer_text_vi: "Tăng tiêu hao nhiên liệu và nguy cơ nổ lốp", answer_text_es: "Mayor consumo y riesgo de reventón" },
      { id: 65, order_number: 2, is_correct: false, answer_text_vi: "Xe chạy êm hơn, không ảnh hưởng gì", answer_text_es: "El coche va más suave, sin consecuencias" },
      { id: 66, order_number: 3, is_correct: false, answer_text_vi: "Giúp xe bám đường tốt hơn", answer_text_es: "Mejora la adherencia" },
    ],
  },
  {
    id: 23, quiz_id: 3, order_number: 5, points: 1,
    question_text_vi: "Khi đỗ xe trên dốc xuống, bạn nên để số nào?",
    question_text_es: "Al estacionar en una pendiente descendente, ¿qué marcha debe dejar?",
    explanation_vi: "Khi đỗ xe xuống dốc, nên để số lùi (số de) và quay bánh xe về phía lề đường.",
    explanation_es: "Al aparcar en bajada, debe dejar la marcha atrás y girar las ruedas hacia el bordillo.",
    answers: [
      { id: 67, order_number: 1, is_correct: true, answer_text_vi: "Số lùi", answer_text_es: "Marcha atrás" },
      { id: 68, order_number: 2, is_correct: false, answer_text_vi: "Số 1", answer_text_es: "Primera marcha" },
      { id: 69, order_number: 3, is_correct: false, answer_text_vi: "Số trung gian (mo)", answer_text_es: "Punto muerto" },
    ],
  },
  {
    id: 24, quiz_id: 3, order_number: 6, points: 1,
    question_text_vi: "Hiệu ứng aquaplaning (trượt nước) xảy ra khi nào?",
    question_text_es: "¿Cuándo se produce el efecto aquaplaning?",
    explanation_vi: "Aquaplaning xảy ra khi lốp xe không thể thoát nước đủ nhanh, thường ở tốc độ cao trên đường ngập nước.",
    explanation_es: "El aquaplaning ocurre cuando los neumáticos no pueden evacuar el agua, generalmente a alta velocidad en carretera encharcada.",
    answers: [
      { id: 70, order_number: 1, is_correct: true, answer_text_vi: "Khi xe chạy nhanh trên đường ngập nước", answer_text_es: "Al circular rápido sobre carretera encharcada" },
      { id: 71, order_number: 2, is_correct: false, answer_text_vi: "Khi phanh trên đường khô", answer_text_es: "Al frenar en carretera seca" },
      { id: 72, order_number: 3, is_correct: false, answer_text_vi: "Khi xe đỗ dưới mưa", answer_text_es: "Cuando el coche está aparcado bajo la lluvia" },
    ],
  },
  {
    id: 25, quiz_id: 3, order_number: 7, points: 1,
    question_text_vi: "Khi lái xe ban đêm, nên nhìn vào đâu khi có xe đối diện bật đèn pha?",
    question_text_es: "Al conducir de noche, ¿dónde debe mirar cuando un vehículo en sentido contrario lleva las luces largas?",
    explanation_vi: "Nên nhìn về phía lề đường bên phải để tránh bị chói mắt bởi đèn pha xe đối diện.",
    explanation_es: "Debe mirar hacia el borde derecho de la calzada para evitar el deslumbramiento.",
    answers: [
      { id: 73, order_number: 1, is_correct: true, answer_text_vi: "Nhìn về phía lề đường bên phải", answer_text_es: "Mirar hacia el borde derecho de la calzada" },
      { id: 74, order_number: 2, is_correct: false, answer_text_vi: "Nhìn thẳng vào đèn xe đối diện", answer_text_es: "Mirar directamente a las luces del otro vehículo" },
      { id: 75, order_number: 3, is_correct: false, answer_text_vi: "Nhắm mắt lại một chút", answer_text_es: "Cerrar un poco los ojos" },
    ],
  },
  {
    id: 26, quiz_id: 3, order_number: 8, points: 1,
    question_text_vi: "Trước khi khởi hành xe, bạn nên kiểm tra gì?",
    question_text_es: "Antes de poner en marcha el vehículo, ¿qué debe comprobar?",
    explanation_vi: "Trước khi khởi hành cần kiểm tra gương, đèn, lốp, dây an toàn và các thiết bị cơ bản.",
    explanation_es: "Antes de arrancar debe comprobar espejos, luces, neumáticos, cinturón y elementos básicos.",
    answers: [
      { id: 76, order_number: 1, is_correct: true, answer_text_vi: "Gương chiếu hậu, đèn, lốp và dây an toàn", answer_text_es: "Espejos, luces, neumáticos y cinturón" },
      { id: 77, order_number: 2, is_correct: false, answer_text_vi: "Chỉ cần thắt dây an toàn là đủ", answer_text_es: "Solo abrocharse el cinturón es suficiente" },
      { id: 78, order_number: 3, is_correct: false, answer_text_vi: "Không cần kiểm tra gì, chỉ cần nổ máy", answer_text_es: "No hace falta comprobar nada, solo arrancar" },
    ],
  },
];

export const sampleLeaderboard = [
  { rank: 1, full_name: "Nguyễn Văn An", total_score: 98.5, total_quizzes: 25, avatar_url: null },
  { rank: 2, full_name: "María García", total_score: 95.2, total_quizzes: 22, avatar_url: null },
  { rank: 3, full_name: "Trần Thị Bình", total_score: 93.8, total_quizzes: 20, avatar_url: null },
  { rank: 4, full_name: "Carlos López", total_score: 91.0, total_quizzes: 18, avatar_url: null },
  { rank: 5, full_name: "Phạm Minh Đức", total_score: 89.5, total_quizzes: 17, avatar_url: null },
  { rank: 6, full_name: "Ana Martínez", total_score: 87.3, total_quizzes: 15, avatar_url: null },
  { rank: 7, full_name: "Lê Hoàng Nam", total_score: 85.0, total_quizzes: 14, avatar_url: null },
  { rank: 8, full_name: "Pedro Sánchez", total_score: 82.6, total_quizzes: 13, avatar_url: null },
];

export type Language = "vi" | "es";
