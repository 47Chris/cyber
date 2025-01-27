import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useIsFocused } from "@react-navigation/native";
import { getDocs, collection } from 'firebase/firestore';
import { FIREBASE_DB } from "@/firebaseConfig";

export default function Index() {
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [currentDayProgress, setCurrentDayProgress] = useState(70);
    const [selectedDayLessonDocs, setSelectedDayLessonDocs] = useState(null);
    const [dayLesson, setDayLesson] = useState(0);
    const isFocused = useIsFocused();
    const [selectedTab, setSelectedTab] = useState('1.Getting_Started_01_07');
    const [priceActionFundamentals, setPriceActionFundamentals] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dayLessonData, setDayLessonData] = useState({});

    const ratingColors = {
        1: "#F44336", // Red
        2: "#ff7c0b", // Orange
        3: "#FFC107", // Yellow
        4: "#8BC34A", // Light Green
        5: "#4CAF50", // Green
    };

    useEffect(() => {
        const fetchPriceActionFundamentals = async () => {
            try {
                const priceActionFundamentalsSnapshot = await getDocs(collection(FIREBASE_DB, "priceActionFundamentals"));
                const fetchedPriceActionFundamentals = [];
                priceActionFundamentalsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedPriceActionFundamentals.push({ id: doc.id, ...data });
                });
                setPriceActionFundamentals(fetchedPriceActionFundamentals);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchDayLessonData = async () => {
            try {
                const dayLessonSnapshot = await getDocs(collection(FIREBASE_DB, "dayLesson"));
                const fetchedDayLessonData = {};
                dayLessonSnapshot.forEach((doc) => {
                    fetchedDayLessonData[doc.id] = doc.data().progress;
                });
                setDayLessonData(fetchedDayLessonData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPriceActionFundamentals();
        fetchDayLessonData();
    }, []);

    useEffect(() => {
        if (selectedTab) {
            const filterDataById = (id) => {
                return priceActionFundamentals.filter(item => item.id === id);
            };
            setFilteredData(filterDataById(selectedTab));
        } else {
            setFilteredData(priceActionFundamentals); // Show all data if no tab is selected
        }
    }, [priceActionFundamentals, selectedTab]);

    const filterData = useMemo(() => 
        priceActionFundamentals.map(item => ({
            title: item.id.replace(/_[0-9]+_[0-9]+$/, '').replace(/_/g, ' ').split('.').slice(1).join(' '),
            id: item.id
        })), [priceActionFundamentals]
    );

    const getLatestProgressColor = (videoId) => {
        if (!dayLessonData[videoId] || dayLessonData[videoId].length === 0) {
            return 'grey'; // Default color if no progress data
        }

        const latestProgress = dayLessonData[videoId][0]; // Assuming the first item is the latest progress
        return ratingColors[latestProgress.rating] || 'grey'; // Default to grey if rating not in ratingColors
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Price Action Fundamentals</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryDetails}>
                            <View>
                                <Text style={{ fontFamily: "SF-UI-Display-Regular" }}>Videos</Text>
                                <Text style={styles.statValue}>15/30</Text>
                            </View>
                            <View>
                                <Text style={{ fontFamily: "SF-UI-Display-Regular" }}>Hours</Text>
                                <Text style={styles.statValue}>6/12</Text>
                            </View>
                        </View>
                        <View style={styles.completionBox}>
                            <Text style={styles.completionText}>50%</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.moduleFilter}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={filterData}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => <View style={{ width: 18 }} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => setSelectedTab(item.id)}>
                                <View style={[styles.moduleFilterItem, item.id === selectedTab && styles.active]}>
                                    <Text style={[styles.moduleTitle, { color: "#b3b3b6" }, item.id === selectedTab && styles.active]}>
                                        {item.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                <View style={{ height: 2, backgroundColor: '#ddd', marginTop: -2, marginBottom: 16, zIndex: -1 }} />
                {filteredData.map((module) => (
                    <View key={module.id} style={styles.moduleWrapper}>
                        <View style={styles.moduleStats}>
                            <Text style={styles.statText}>Videos: {module.totalVideos}</Text>
                            <Text style={styles.statText}>Duration: {module.totalDuration} hours</Text>
                        </View>
                        {module.videos.map((video) => (
                            <View key={video.id} style={styles.lessonItem}>
                                <View style={{ width: 4, backgroundColor: getLatestProgressColor(video.id), borderRadius: 2, marginRight: 8 }} />
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: "space-between", gap: 24 }}>
                                        <Text style={styles.lessonText}>{video.id} {video.title}</Text>
                                        <Text style={styles.lessonDuration}>{video.duration} min</Text>
                                    </View>
                                    <View style={styles.lessonTopics}>
                                        <View style={styles.listContainer}>
                                            {video.topics.map(topic => (
                                                <Text key={topic} style={styles.listText}>{"\u2022"} {topic}</Text>
                                            ))}
                                        </View>
                                    </View>
                                    {/* {dayLessonData[video.id] && (
                                        <View style={styles.progressContainer}>
                                            {dayLessonData[video.id].map((progress, index) => (
                                                <View key={index} style={styles.progressItem}>
                                                    <Text style={styles.progressText}>Date: {new Date(progress.date.seconds * 1000).toLocaleDateString()}</Text>
                                                    <Text style={styles.progressText}>Rating: {progress.rating}</Text>
                                                    <Text style={styles.progressText}>Watching: {progress.watching}</Text>
                                                    <Text style={styles.progressText}>Writing: {progress.writing}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )} */}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 15,
        backgroundColor: "#ffffff",
        fontFamily: 'SF-UI-Display-Regular',
    },
    sectionHeader: {
        paddingBottom: 15,
    },
    sectionTitle: {
        fontWeight: "600",
        fontSize: 40,
        fontFamily: 'SF-UI-Display-Bold',
        lineHeight: 40,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    summaryDetails: {
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
    },
    statValue: {
        fontWeight: "600",
        fontSize: 14,
        fontFamily: 'SF-UI-Display-Bold',
    },
    completionBox: {
        backgroundColor: "#f0f0f0",
          paddingHorizontal: 12,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    completionText: {
        fontWeight: "600",
        fontSize: 18,
    },
    moduleFilterItem: {
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    active: {
        borderBottomColor: "#333",
        color: "#333",
    },
    moduleWrapper: {
        marginBottom: 20,
        borderRadius: 10,
    },
    moduleTitle: {
        fontSize: 20,
        marginBottom: 6,
        fontFamily: 'SF-UI-Display-Bold',
    },
    moduleStats: {
        marginBottom: 16,
    },
    statText: {
        fontSize: 16,
        fontFamily: 'SF-UI-Display-Regular',
    },
    lessonItem: {
        marginBottom: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        flexDirection: "row",
        overflow: "hidden",
        paddingRight: 8,
    },
    lessonText: {
        fontWeight: "600",
        fontSize: 16,
        flex: 4,
        marginBottom: 4,
        fontFamily: 'SF-UI-Display-Bold',
        marginTop: 8,
    },
    lessonDuration: {
        fontSize: 14,
        color: "#4C4C4C",
        flex: 1,
        fontFamily: 'SF-UI-Display-Regular',
    },
    lessonTopics: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
        marginBottom: 8,
    },
    listText: {
        fontSize: 14,
        fontFamily: 'SF-UI-Display-Regular',
        color: "#4C4C4C",
    },
    progressContainer: {
        marginTop: 8,
        backgroundColor: "#e0e0e0",
        padding: 10,
        borderRadius: 8,
    },
    progressItem: {
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        fontFamily: 'SF-UI-Display-Regular',
        color: "#333",
    },
});
