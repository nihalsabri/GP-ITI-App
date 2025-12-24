// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

// export default function Navbar() {
//   const navigation = useNavigation(); 
//   const [open, setOpen] = useState(false);

//   const menuItems = [
//     { id: 1, label: 'Home', icon: 'home' },
//     { id: 2, label: 'Meals', icon: 'pizza' },
//     { id: 3, label: 'Settings', icon: 'Settings' },

//   ];

//   return (
//     <View style={{ width: '100%', backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }}>


//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'orange' }}>Food</Text>
//         <TouchableOpacity onPress={() => setOpen(!open)} style={{ padding: 6, backgroundColor: '#eff6ff', borderRadius: 6 }}>
//           <Ionicons name={open ? 'close' : 'menu'} size={28} color="orange" />
//         </TouchableOpacity>
//       </View>


//       {/* menu */}
//       {open && (
//         <View style={{ marginTop: 10, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 6 }}>
//           {menuItems.map((item, index) => (
//             <TouchableOpacity
//               key={item.id}
//               style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, marginBottom: index !== menuItems.length - 1 ? 6 : 0, borderRadius: 8 }}
//               onPress={() => {
//                 navigation.navigate(item.label);
//                 setOpen(false);
//               }}
//             >
//               <Ionicons name={item.icon} size={22} color="#2563eb" style={{ marginRight: 8 }} />
//               <Text style={{ fontSize: 16, color: '#1f2937' }}>{item.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }
