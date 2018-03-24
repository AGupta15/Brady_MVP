import csv
import numpy as np


#Load in Datapoints
from numpy import genfromtxt
my_data = genfromtxt('pbp.csv', delimiter=',')
print my_data[2][35]