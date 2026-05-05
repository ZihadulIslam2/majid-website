// import React, { useState } from "react";
// import { X, DollarSign, Clock, Paperclip, Loader2, Send, Ban } from "lucide-react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";

// const RepairOfferModal = ({ isOpen, onClose }) => {
//   // Local states for input fields
//   const [noteCost, setNoteCost] = useState("");
//   const [noteDays, setNoteDays] = useState("");
//   const [noteMessage, setNoteMessage] = useState("");
//   const [noteImages, setNoteImages] = useState([]);
//   const [isPending, setIsPending] = useState(false);

//   if (!isOpen) return null;

//   // Log Data and close
//   const handleSendOffer = () => {
//     console.log("Offer Data:", {
//       message: noteMessage,
//       cost: Number(noteCost),
//       estimatedDays: Number(noteDays),
//       images: noteImages,
//     });
//     onClose();
//   };

//   const handleReject = () => {
//     console.log("Repair Rejected");
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//       <div className="bg-card border border-border w-full max-w-lg rounded-[40px] p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">

//         {/* Close Icon */}
//         <button
//           onClick={onClose}
//           className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
//         >
//           <X size={20} className="text-muted-foreground" />
//         </button>

//         <div className="space-y-1">
//           <h3 className="text-2xl font-black text-foreground tracking-tight">Repair Action</h3>
//           <p className="text-sm font-medium text-muted-foreground">Send an offer or reject the request.</p>
//         </div>

//         {/* Input Fields */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estimated Cost</label>
//             <div className="relative">
//               <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
//               <input
//                 type="number"
//                 value={noteCost}
//                 onChange={(e) => setNoteCost(e.target.value)}
//                 placeholder="1500"
//                 className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-colors"
//               />
//             </div>
//           </div>
//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estimated Days</label>
//             <div className="relative">
//               <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
//               <input
//                 type="number"
//                 value={noteDays}
//                 onChange={(e) => setNoteDays(e.target.value)}
//                 placeholder="3"
//                 className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-colors"
//               />
//             </div>
//           </div>
//         </div>

//         <textarea
//           value={noteMessage}
//           onChange={(e) => setNoteMessage(e.target.value)}
//           placeholder="Add your message here..."
//           className="w-full h-32 p-5 bg-surface border border-border rounded-[24px] font-bold text-sm outline-none focus:border-primary transition-colors resize-none"
//         />

//         {/* Image Proof Gallery */}
//         <div className="flex flex-wrap gap-2">
//           {noteImages.map((file, idx) => (
//             <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
//               <Image src={URL.createObjectURL(file)} alt="preview" fill className="object-cover" />
//               <button
//                 onClick={() => setNoteImages(prev => prev.filter((_, i) => i !== idx))}
//                 className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
//               >
//                 <X size={10} />
//               </button>
//             </div>
//           ))}
//           {noteImages.length < 4 && (
//             <label className="w-16 h-16 rounded-xl border border-dashed border-border bg-surface flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-all">
//               <Paperclip size={18} className="text-muted-foreground" />
//               <input
//                 type="file" multiple accept="image/*" className="sr-only"
//                 onChange={(e) => setNoteImages(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 4))}
//               />
//             </label>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3 pt-2">
//           <Button
//             onClick={handleReject}
//             variant="outline"
//             className="flex-1 h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full font-black text-sm uppercase tracking-widest transition-all"
//           >
//             <Ban size={18} className="mr-2" /> Reject
//           </Button>
//           <Button
//             onClick={handleSendOffer}
//             className="flex-1 h-14 bg-[#84CC16] hover:bg-[#71AF12] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-lime-500/20 transition-all"
//           >
//             <Send size={18} className="mr-2" /> Send Offer
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RepairOfferModal;
