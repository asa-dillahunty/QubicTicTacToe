all :
	javac *.java

run : all
	java QubicBoard

clean :
	rm *.class
